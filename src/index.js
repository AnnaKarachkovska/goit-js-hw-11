import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    form: document.querySelector('.search-form'),
    input: document.querySelector('input'),
    gallery: document.querySelector('.gallery'),
    loadBtn: document.querySelector('.load-more')
};

let photosPerPage = 40;
let name = '';
let lightbox;

const config = {
    params: {
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        per_page: photosPerPage,
        page: 1
    }
};

refs.form.addEventListener('submit', searchPhoto);
refs.loadBtn.addEventListener('click', loadMore);

async function searchPhoto(ev) {
    ev.preventDefault();
    if (config.params.page !== 1) {
        config.params.page = 1;
    }
    try {
        const searchResult = await fetchPhotos();

        if (searchResult.data.totalHits === 0) {
            resetPhoto();
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            return;
        };

        Notiflix.Notify.success(`Hooray! We found ${searchResult.data.totalHits} images.`);
        
        if (refs.gallery.firstChild !== null) {
            resetPhoto();
        }

        const photoArray = searchResult.data.hits;

        renderPhotos(photoArray);

        refs.loadBtn.classList.add('active');

        if (photoArray.length < photosPerPage) {
            refs.loadBtn.classList.remove('active');
        } 

    } catch (error) {
        console.log(error);
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    }
};

async function loadMore(ev) {
    ev.preventDefault();
    config.params.page++;

    try {
        const response = await axios.get(`https://pixabay.com/api/?key=30371863-50c68a801fb6a7099c6679001&q=${name}`, config);
        const totalPages = response.data.totalHits / photosPerPage;
    
        if (config.params.page > Math.ceil(totalPages)) {
            refs.loadBtn.classList.remove('active');
            Notiflix.Notify.info(`We're sorry, but you've reached the end of search results.`)
            return;
        };

        renderPhotos(response.data.hits);
        lightbox.refresh();
    } catch (error) {
        console.log(error);
    }
};

async function fetchPhotos() {
    name = refs.input.value;
    if (refs.input.value === '') {
        resetPhoto();
        return;
    };
    const response = await axios.get(`https://pixabay.com/api/?key=30371863-50c68a801fb6a7099c6679001&q=${name}`, config);
    refs.form.reset();
    return response;
}; 

function renderPhotos(array) {
            const markup = array
                .map(({largeImageURL, webformatURL, tags, likes, views, comments, downloads }) => {
                    return `
                    <div class="photo-card">
                <div class="thumb"><a class="gallery-item" href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width=400/></a></div>
                
                <div class="info">
                    <p class="info-item">
                      <b>Likes</b>${likes}
                    </p>
                    <p class="info-item">
                       <b>Views</b>${views}
                     </p>
                    <p class="info-item">
                       <b>Comments</b>${comments}
                    </p>
                    <p class="info-item">
                       <b>Downloads</b>${downloads}
                    </p>
                 </div>
            </div>`;
                })
                .join('');

    refs.gallery.insertAdjacentHTML('beforeend', markup);
    lightbox = new SimpleLightbox('.gallery-item');
};

function resetPhoto() {
    for (let i = 0; i < refs.gallery.children.length; i++) {
        refs.gallery.firstChild.remove();
        refs.loadBtn.classList.remove('active');
        i--
    }
};

// const lightbox = new SimpleLightbox('.gallery-item');

        // for (let i = 0; i < photoArray.length; i++) {
        //     refs.gallery.insertAdjacentHTML('beforeend', 
        //     `<div class="photo-card">
        //         <div class="thumb"><img src="${photoArray[i].webformatURL}" alt="${photoArray[i].tags}" loading="lazy" width=400/></div>
                
        //         <div class="info">
        //             <p class="info-item">
        //               <b>Likes</b>${photoArray[i].likes}
        //             </p>
        //             <p class="info-item">
        //                <b>Views</b>${photoArray[i].views}
        //              </p>
        //             <p class="info-item">
        //                <b>Comments</b>${photoArray[i].comments}
        //             </p>
        //             <p class="info-item">
        //                <b>Downloads</b>${photoArray[i].downloads}
        //             </p>
        //          </div>
        //     </div>`)
        // }