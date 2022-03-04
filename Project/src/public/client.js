let store = Immutable.Map({
    user: Immutable.Map({ name: 'Student' }),
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit'])
});

// add our markup to the page
const root1 = document.getElementById('root1');
const root2 = document.getElementById('root2');
const nav = document.getElementById('nav');

const updateStore = (root, state, newState, app) => {
    store = state.merge(newState);
    render(root, app)(store);
}

const render = (root, app) => async state => {
    try {
        root.innerHTML = await app(state);
    } catch(err) {
        root.innerHTML = "<h1>Loading...</h1>";
    }
}

// create content
const App = state => {

    return (`
        ${Greeting(state.getIn(['user', 'name']))}
        <h1>
            One of the most popular websites at NASA is the Astronomy Picture of the Day (APOD).
        </h1>
        ${ImageOfTheDay(state.getIn(['image']))}
    `)
}

const App2 = state => {
    if (!state.toJS().roverIndex){
        const newState =  state.setIn(['roverIndex'], 0);
        store = newState.merge(state);
    }
    return `${pictureGallery(state.toJS().roverIndex)}`;
}

nav.addEventListener('click', event => {

    const content = event.target.textContent;
    const rovers = store.getIn(['rovers']).toJS();
    
    if (content !== 'APOD Image'){

        const button = document.getElementById('btn');
        button.scrollIntoView({behavior: 'smooth'});

        if (content.includes('C')) {

            const roverIndex = rovers.indexOf('Curiosity');
            const newState = store.setIn(['roverIndex'], roverIndex);
            store = store.merge(newState);

        } else if (content.includes('O')) {
            const roverIndex = rovers.indexOf('Opportunity');
            const newState = store.setIn(['roverIndex'], roverIndex);
            store = store.merge(newState);
        }
        else {

            const roverIndex = rovers.indexOf('Spirit');
            const newState = store.setIn(['roverIndex'], roverIndex);
            store = store.merge(newState);
        } 
    } else {
    
        const button0 = document.getElementById('btn0');
        button0.scrollIntoView({behavior: 'smooth'})      
    }

});

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root1, App)(store);
    render(root2, App2)(store);
});

setInterval(() => {
    render(root2, App2)(store);
}, 3000);

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
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

// Example of a pure function that renders infomation requested from the backend
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
                <img src="${apod.url}" id="btn0"/>
                <p>${apod.explanation}</p>
            `)
        }
    }
}

const pictureGallery = rover => {
  
    const get = store.getIn(['photos']);
    if(!get) {
        getRoverNavigationPhotos(store);
    }
    
    const len = get[rover].photos.length;
    const randomly = Math.floor(Math.random() * len);
    const pics = get[rover].photos[randomly];

    if(len > 0) {
        return (`
                <img src="${pics.img_src}" id="btn"/>
                <ul>
                    <li>Martian Rover: ${pics.rover.name}</li>
                    <li>Camera: ${pics.camera.full_name}
                    <li>Launch Date: ${pics.rover.launch_date}</li>
                    <li>Landing Date: ${pics.rover.landing_date}</li>
                    <li>Status: ${pics.rover.status}</li>
                    <li>Date of Photos: ${pics.earth_date}</li>
                <ul/>
            `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = state => {

    fetch('http://localhost:3000/apod')
        .then(res => res.json())
        .then(apod => updateStore(root1, state, apod, App))

}

const getRoverNavigationPhotos = state => {

    fetch('http://localhost:3000/photos')
        .then(res => res.json())
        .then(pics => updateStore(root2, state, pics, App2))

}
