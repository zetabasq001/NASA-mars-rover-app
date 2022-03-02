let store = Immutable.Map({
    user: Immutable.Map({ name: 'Student' }),
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit'])
});

// add our markup to the page
const root1 = document.getElementById('root1');
const root2 = document.getElementById('root2');

const updateStore = (root, state, newState, app) => {
    store = state.merge(newState);
    render(root, app)(store);
}

const render = (root, app) => state => {
    root.innerHTML = app(state);
}

// create content
const App = state => {

    return `
        <header></header>
        <main>
            ${Greeting(state.getIn(['user', 'name']))}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(state.getIn(['image']))}
            </section>
        </main>
        <footer></footer>
    `
}

const App2 = state => {
    return `${pictureGallery(state, '')}`
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root1, App)(store);
    setInterval(() => {
        render(root2, App2)(store);}
        , 3000);
});

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

const addTabs = state => {
    return (`<div>
                <h2>${state.getIn(['rovers'])[0]}</h2>
                <p></p>
            </div>`)
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
                <img src="${apod.url}" height="350px" width="100%" />
                <p>${apod.explanation}</p>
            `)
        }
    }
}

const pictureGallery = (state, rover) => {

    if(!store.getIn(['photos'])) {
        getRoverNavigationPhotos(state);
    }

    const len = store.getIn(['photos'])[0].photos.length;
    const rand = Math.floor(Math.random() * len);
    const pics = store.getIn(['photos'])[0].photos[rand];

    if(len > 0){
        return (
            `<div>
                <div><img src="${pics.img_src}" height ="350px" width="50%"/></div>
                <div><p></p><div/>
            </div>`)
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

