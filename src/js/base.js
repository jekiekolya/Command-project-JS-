import SearchService from './api';
import 'lazysizes';
import 'lazysizes/plugins/parent-fit/ls.parent-fit';
import Notiflix from 'notiflix';
const searchService = new SearchService();

const inputRef = document.querySelector('.input-text');
const formRef = document.querySelector('form');
const mainContainer = document.querySelector('.container-main');
const btnnHeaderRef = document.querySelector('.button-header');
const select = document.querySelector('.select-country');
let country = '';
let page = 0;

window.onload = function () {
  document.body.classList.add('loaded_hiding');
  window.setTimeout(function () {
    document.body.classList.add('loaded');
    document.body.classList.remove('loaded_hiding');
  }, 500);
};

btnnHeaderRef.addEventListener('click', fetchData);
formRef.addEventListener('submit', fetchData);

select.addEventListener('change', () => {
  country = select.value;
  fetchDataCountry();
});

async function fetchDataCountry(e) {
  searchQuery = inputRef.value.trim();
  const data = await searchService
    .fetchApiEvent(searchQuery, country, page)
    .then(res => res._embedded.events)
    .catch(err => {
      Notiflix.Notify.failure(
        'Sorry, we did not find anything, refine your query'
      );
    });
  clearData();
  if (data) {
    createMarkup(data);
  }
}

async function fetchData(e) {
  e.preventDefault();
  searchQuery = inputRef.value.trim();
  inputRef.value = '';
  const data = await searchService
    .fetchApiEvent(searchQuery, country, page)
    .then(res => res._embedded.events)
    .catch(err => {});
  clearData();
  if (data) {
    createMarkup(data);
  } else {
    createError();
  }
}

/*============================================= main page====================================================== */
function createMarkup(array) {
  cleanError();
  localStorage.setItem('eventsData', JSON.stringify(array));
  const gallery = document.querySelector('.gallery');
  let i = 0;
  const cards = array
    .map(card => {
      return `<li class="gallery__itams" data-id="${card.id}">
          <a class="gallery-link" href="${
            card.url
          }" data-eventID="${i++}" data-id="${card.id}">
            <div class="gallary-link__wrap">
              <div class="gallary-link__border"></div>
              <img
                class="gallery-link__img lazyload"
                src="${lowQualitiPhotoPicker(card.images)}"
                data-src="${rightPhotoUrl(card.images)}"
                alt=""
              />
            </div>

            <h2 class="gallary-link__title">${card.name}</h2>
            <p class="gallery__date">${card.dates.start.localDate}</p>
            </a>

          <a class="gallery__place" href="${getCoordinates(
            card
          )}" data="${getPlaceName(card)}">
           
            <span >${getPlaceName(card)}</span>
          </a>
        </li>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', cards);
  // offEmptyHref();
  hideEmptyPlace();
}

function getCoordinates(card) {
  try {
    return `http://www.google.com/maps/place/${card._embedded.venues[0].location.latitude},${card._embedded.venues[0].location.longitude}`;
  } catch (error) {
    return undefined;
  }
}

function getPlaceName(card) {
  try {
    return card._embedded.venues[0].name;
  } catch (error) {
    return undefined;
  }
}

function offEmptyHref() {
  const hrefToOff = document.querySelector('[href="undefined"]');
  hrefToOff.preventDefault();
}

function hideEmptyPlace() {
  const placeToHide = document.querySelector('[data="undefined"]');
  if (placeToHide) {
    placeToHide.classList.add('is-hidden');
  }
}

function clearData() {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';
}

function lowQualitiPhotoPicker(array) {
  array.sort((a, b) => {
    return a.width - b.width;
  });

  return array[0].url;
}

function rightPhotoUrl(array) {
  array.sort((a, b) => {
    return a.width - b.width;
  });

  try {
    if (window.devicePixelRatio === 1) {
      const photo = array.filter(photo => photo.url.includes('CUSTOM'));

      return photo[0].url;
    } else {
      const retinaPhoto = array
        .filter(photo => photo.url.includes('RETINA'))
        .filter(photo => photo.ratio.includes('3_2'));
      return retinaPhoto[0].url;
    }
  } catch (error) {
    return array[0].url;
  }
}

async function doMagic() {
  const data = await searchService.fetchDefoltEvent();

  createMarkup(data);
}

doMagic();
/*============================================= main page====================================================== */

function createError() {
  mainContainer.insertAdjacentHTML(
    'afterbegin',
    `<div class="error"> Sorry, we did not find anything, refine your query! </div>`
  );
}

function cleanError() {
  const er = document.querySelector('.error');
  if (er) {
    er.remove();
  }
}
