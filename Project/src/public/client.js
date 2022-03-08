// stores app's data
let store = Immutable.Map({
    user: Immutable.Map({ name: 'Earthling' }),
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
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
        mark.innerHTML = "<h1>Problem Loading...</h1>";
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
    return i => `<button>${rovers[i - 1]}</button>`;
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
    
    // direct the viewer to select a rover via navigation bar
    const index = state.toJS().roverIndex;
    if(!(index + 1)){
        return '<p>Select a Martian Rover above!</p>';
    }

    // function renders active rover pictures and information from the backend
    return `${RoverPictures(index)}`;
};

// dynamic navigation bar
nav.addEventListener('click', event => {

    // for each button clicked get content
    const content = event.target.textContent;

    // obtain the rovers from store
    const rovers = store.getIn(['rovers']).toJS();

    // select the rover
    const rover = rovers.filter(r => r === content)[0];

    // determine its index
    const roverIndex = rovers.indexOf(rover);

    // update the index of the rover in the store and render rover pictures
    const newState = store.setIn(['roverIndex'], roverIndex);
    updateStore(root2, store, newState, App2);

    // let rover photos render below before scrolling down
    setTimeout(() => {      
        const button = document.getElementById('btn');
        button.scrollIntoView({behavior: 'smooth'});
    }, 1000);
      
});

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(nav, App0)(store);
    render(root1, App1)(store);
    render(root2, App2)(store);
});

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
                <p id="btn"></p>
            `)
        } else {
            return (`
                <img src="${apod.url}"/>
                <p>${apod.explanation}</p>
                <p id="btn"></p>
            `)
        }
    }
}

// get and display latest rover pictures
const RoverPictures = rover => {

    // if not in store get rover pictures
    const get = store.getIn(['photos']);
    if(!get) {
        getRoverNavigationPhotos(store);
    }
    
    // get up to five latest (if available) pictures
    const pics = get[rover].slice(0, 5);
    const size = pics.length;

    // html with rover pictures
    const Pics = index => {
       
        return `<img src="${pics[index - 1].img_src}"/>
                <p>Type of Camera: ${pics[index - 1].camera.full_name}</p>`
    }

    // html with rover information
    const Info = () => `<ul>
                            <li>Martian Rover Name: ${pics[0].rover.name}</li>
                            <li>Launch Date from Earth: ${pics[0].rover.launch_date}</li>
                            <li>Landing Date on Mars: ${pics[0].rover.landing_date}</li>
                            <li>Status: ${pics[0].rover.status}</li>
                            <li>Date of Photos: ${pics[0].earth_date}</li>
                        <ul/>`

    // builds html with rover pictures and information
    const Display = () => Info() + createArray(size).map(n => Pics(n)).join('');
    
    // results to be displayed
    return (`${Display()}`);
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
