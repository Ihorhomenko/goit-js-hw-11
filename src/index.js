import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const axios = require('axios').default;

const API_KEY = '25076604-b2f6a049f29fb1061528c9102';
const API_URL = 'https://pixabay.com/api/';
const PER_PAGE = 40;

let page = 1;
let inputValue = '';
let gallerySimpleLightbox = '';

const refs = {
  form: document.querySelector('.search-form'),
  inputBtn: document.querySelector('.search-form__btn'),
  galery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.btn'),
};

function onFormSubmit(e) {
  e.preventDefault();

  const {
    elements: { searchQuery },
  } = e.currentTarget;

  inputValue = searchQuery.value;

  refs.galery.innerHTML = '';

  resetPageNumber();

  fetchImg(inputValue);
}

function onBtnLoadClick() {
  page += 1;
  fetchImgOnClickLoadBtn(inputValue);
}

async function fetchImg(name) {
  try {
    const response = await axios.get(
      `${API_URL}?key=${API_KEY}&q=${name}&image_type=photo$orientation=horizontal&safesearch=true&per_page=${PER_PAGE}&page=${page}`,
    );
    buildGelary(response.data);
    gallerySimpleLightbox = new SimpleLightbox('.gallery a');
  } catch (error) {
    Notify.failure(`${error}`);
  }
}

async function fetchImgOnClickLoadBtn(name) {
  try {
    const response = await axios.get(
      `${API_URL}?key=${API_KEY}&q=${name}&image_type=photo$orientation=horizontal&safesearch=true&per_page=${PER_PAGE}&page=${page}`,
    );
    if (PER_PAGE > response.data.hits.length) {
      refs.loadBtn.classList.remove('load-more');
      refs.loadBtn.classList.add('hiden');
      Notify.failure("We're sorry, but you've reached the end of search results.");
    }
    renderImgCards(response.data.hits);
    gallerySimpleLightbox.refresh();
    scroll();
  } catch (error) {
    Notify.failure(`${error}`);
  }
}

function renderImgCards(obj) {
  obj.map(el => {
    const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = el;
    const imgCard = `<a href="${largeImageURL}"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div></a>`;
    return refs.galery.insertAdjacentHTML('beforeend', imgCard);
  });
}

function resetPageNumber() {
  return (page = 1);
}

function buildGelary(d) {
  if (d.hits.length < 1) {
    refs.loadBtn.classList.remove('load-more');
    refs.loadBtn.classList.add('hiden');
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
    );
  } else if (PER_PAGE > d.hits.length) {
    refs.loadBtn.classList.remove('load-more');
    refs.loadBtn.classList.add('hiden');
    Notify.failure("We're sorry, but you've reached the end of search results.");
    return renderImgCards(d.hits);
  }
  renderImgCards(d.hits);
  refs.loadBtn.classList.remove('hiden');
  refs.loadBtn.classList.add('load-more');
  Notify.success(`Hooray! We found ${d.totalHits} images.`);
  scroll();
}

function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 3,
    behavior: 'smooth',
  });
}

refs.form.addEventListener('submit', onFormSubmit);
refs.loadBtn.addEventListener('click', onBtnLoadClick);
