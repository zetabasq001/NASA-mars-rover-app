// store app data pulled from NASA api
let store = Immutable.Map({
    user: Immutable.Map({ name: 'Earthling' }),
    rovers: Immutable.List(['Perseverance', 'Curiosity', 'Opportunity', 'Spirit'])
});

// add the markup to the page
const root1 = document.getElementById('root1');
const root2 = document.getElementById('root2');
const nav = document.getElementById('nav');

// update store and renders app component
const updateStore = (root, state, newState, app) => {
    store = state.merge(newState);
    render(root, app)(store);
}

// renders app component
const render = (root, app) => async state => {
    try {
        root.innerHTML = await app(state);
    } catch(err) {
        root.innerHTML = "<h1>Loading...</h1>";
    }
}

// component renders APOD Image
const App = state => {

    return (`
        ${Greeting(state.getIn(['user', 'name']))}
        <p id="btn0">
            One of the most popular websites at NASA is the Astronomy Picture of the Day (APOD).
        <p>
        ${ImageOfTheDay(state.getIn(['image']))}
    `)
}

// component renders mars rover pictures
const App2 = state => {

    // if the index of active rover is not set in store set to default 0
    if (!state.toJS().roverIndex){
        const newState =  state.setIn(['roverIndex'], 0);
        store = newState.merge(state);
    }

    // function renders active rover pictures and information from the backend
    return `${randomRoverPictures(state.toJS().roverIndex)}`;
}

// dynamic navigation bar
nav.addEventListener('click', event => {

    // for each button clicked get content
    const content = event.target.textContent;

    // obtain the rovers from store
    const rovers = store.getIn(['rovers']).toJS();
    
    // if a rover button name is clicked
    if (content !== 'APOD Image'){

        // scroll down to rover section
        const button = document.getElementById('btn');
        button.scrollIntoView({behavior: 'smooth'});

        // depending on which rover
        if (content.includes('C')) {
            
            // get index of rover in array located in store
            const roverIndex = rovers.indexOf('Curiosity');

            // add the current index of active rover to store
            const newState = store.setIn(['roverIndex'], roverIndex);

            // merge new state of the app to store
            store = store.merge(newState);
           
        } else if (content.includes('O')) {
            const roverIndex = rovers.indexOf('Opportunity');
            const newState = store.setIn(['roverIndex'], roverIndex);
            store = store.merge(newState);

        } else if (content.includes('P')) {
            const roverIndex = rovers.indexOf('Perseverance');
            const newState = store.setIn(['roverIndex'], roverIndex);
            store = store.merge(newState);
        }
        else {
            const roverIndex = rovers.indexOf('Spirit');
            const newState = store.setIn(['roverIndex'], roverIndex);
            store = store.merge(newState);
        } 
    } else {
        // scroll to APOD Image
        const button0 = document.getElementById('btn0');
        button0.scrollIntoView({behavior: 'smooth'})      
    }

});

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root1, App)(store);
    render(root2, App2)(store);
});

// renders a random rover picture every 3 seconds
setInterval(() => {
    render(root2, App2)(store);
}, 3000);

// ------------------------------------------------------  COMPONENTS

// function to greet viewers
const Greeting = name => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }
    return `
        <h1>Hello!</h1>
    `
}

// function that renders infomation requested from the backend
const ImageOfTheDay = apod => {
    
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date();
    if (!apod || (new Date(apod.date).getDate() === today.getDate())) {
        getImageOfTheDay(store);
    }

    // check if the photo of the day is actually type video!
    if(apod){
        if (apod.media_type === "video") {
            return (`
                <p>See today's featured video <a href="${apod.url}">here</a></p>
                <p>${apod.title}</p>
                <p>${apod.explanation}</p>
            `)
        } else {
            return (`
                <img src="${apod.url}"/>
                <p>${apod.explanation}</p>
            `)
        }
    }
}

// get and display randomly latest rover pictures
const randomRoverPictures = rover => {

    // only invoke to get rover pictures if not in store
    const get = store.getIn(['photos']);
    if(!get) {
        getRoverNavigationPhotos(store);
    }

    //select random rover picture 
    const got = get[rover]  
    const len = got.length;
    const randomly = Math.floor(Math.random() * len);
    const pics = got[randomly];
    
    //rover picture and information
    return (`
            <img src="${pics.img_src}" id="btn"/>
            <ul>
                <li>${len} Most Recent Photo(s) of</li>
                <li>Martian Rover Name: ${pics.rover.name}</li>
                <li>Picture ID: ${pics.id}</li>
                <li>Type of Camera: ${pics.camera.full_name}
                <li>Launch Date from Earth: ${pics.rover.launch_date}</li>
                <li>Landing Date on Mars: ${pics.rover.landing_date}</li>
                <li>Status: ${pics.rover.status}</li>
                <li>Date of Photos Taken: ${pics.earth_date}</li>
            <ul/>
        `)
}

// ------------------------------------------------------  API CALLS

// API call to get APOD image
const getImageOfTheDay = state => {

    fetch('http://localhost:3000/apod')
        .then(res => res.json())
        .then(apod => updateStore(root1, state, apod, App))

}

// API call to get latest rover pictures
const getRoverNavigationPhotos = state => {

    fetch('http://localhost:3000/photos')
        .then(res => res.json())
        .then(pics => updateStore(root2, state, pics, App2))

}
