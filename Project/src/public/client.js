// stores app's data
let store = Immutable.Map({
    user: Immutable.Map({ name: 'Earthling' }),
    rovers: Immutable.List(['Perseverance', 'Curiosity', 'Opportunity', 'Spirit']),
    roverIndex: 0
});

// add the markup to the page
const root1 = document.getElementById('root1');
const root2 = document.getElementById('root2');
const nav = document.getElementById('nav');

// update store and renders app components
const updateStore = (root, state, newState, app) => {
    store = state.merge(newState);
    render(root, app)(store);
}

// renders app components
const render = (mark, app) => async state => {

    try {
        mark.innerHTML = await app(state);
    } catch(err) {
        mark.innerHTML = "<h1>Loading...</h1>";
    }
};

// recursive function to enumerate the indices of the rover list
const createArray = n => {
    if(n === 1){
        return [n];
    } else {
        return createArray(n-1).concat(n);
    } 
}

// higher order function builds the navigation bar
const Nav = state => {
    
    const rovers = state.getIn(['rovers']).toJS();
    return i => `<button class="btn">${rovers[i - 1]}</button>`;
};

// component renders the navigation bar
const App0 = state => {

    const len = state.getIn(['rovers']).toJS().length;
    return createArray(len).map(n => Nav(state)(n)).join('');
}

// component renders APOD Image
const App1 = state => {

    return (`
        ${Greeting(state.getIn(['user', 'name']))}
        <p>
            One of the most popular websites at NASA is the Astronomy Picture of the Day (APOD).
        <p>
        ${ImageOfTheDay(state.getIn(['image']))}
    `)
};

// component renders mars rover pictures
const App2 = state => {
    
    const index = state.toJS().roverIndex;

    // function renders active rover pictures and information from the backend
    return `${randomRoverPictures(index)}`;
};

// dynamic navigation bar
nav.addEventListener('click', event => {

    // for each button clicked get content
    const content = event.target.textContent;

    // obtain the rovers from store
    const rovers = store.getIn(['rovers']).toJS();

    // scroll down to rover section
    const button = document.getElementById('btn');
    button.scrollIntoView({behavior: 'smooth'});

    // select the rover
    const rover = rovers.filter(r => r === content)[0];

    // determine its index
    const roverIndex = rovers.indexOf(rover);

    // update the index of the rover in the store and render rover pictures
    const newState = store.setIn(['roverIndex'], roverIndex);
    updateStore(root2, store, newState, App2);
         
});

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(nav, App0)(store);
    render(root1, App1)(store);
    render(root2, App2)(store);
});

// renders a random rover picture every 3 seconds
setInterval(() => {
    render(root2, App2)(store);
}, 5000);

// ------------------------------------------------------  COMPONENTS

// function to greet viewers
const Greeting = name => {

    return `
        <h1>Welcome, ${name}!</h1>
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
                <li>Date of Photos: ${pics.earth_date}</li>
            <ul/>
        `)
}

// ------------------------------------------------------  API CALLS

// API call to get APOD image
const getImageOfTheDay = state => {

    fetch('http://localhost:3000/apod')
        .then(res => res.json())
        .then(apod => updateStore(root1, state, apod, App1))

}

// API call to get latest rover pictures
const getRoverNavigationPhotos = state => {

    fetch('http://localhost:3000/photos')
        .then(res => res.json())
        .then(pics => updateStore(root2, state, pics, App2))

}
