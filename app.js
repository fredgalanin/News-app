// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})


// Init http module
const http = customHttp();

const newsService = (function() {
  const apiKey = "2c0eb0ea09e245b2b5e9b3dc82f316e6";
  const apiURL = "https://newsapi.org/v2";

  return {
    topHeadlines(country = 'ru', cb) {
      http.get(`${apiURL}/top-headlines?country=${country}&apiKey=${apiKey}`, cb)
    },

    everything(query, cb) {
      http.get(`${apiURL}/everything?q=${query}&apiKey=${apiKey}`, cb)
    },
  };
})();


//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});


//Load news
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
  
}

//Function on get response from server
function onGetResponse(err, res) {
  removeLoader();
  if (err) {
    showAlert(err, 'error-msg');
    return
  }

  if (!res.articles.length) {
    
    renderNews([{}]);
    return
  }

  renderNews(res.articles);
}

//Function render news
function renderNews(news) {
 const newsContainer = document.querySelector('.news-container .row');
 if (newsContainer.children.length) {
   clearContainer(newsContainer);
 }
  let fragment = '';
 news.forEach(newsItem => {
   const el = newsTemplate(newsItem);
    fragment += el;
 })

 newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

//Function to clear container
function clearContainer(container) {
  let child = container.lastElementChild;

  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

//Create news item template function
function newsTemplate({urlToImage = 'http://denrakaev.com/wp-content/uploads/2015/03/no-image-800x511.png', title = "NO NEWS", url = '', description = 'Change your request'}) {
  return `
  <div class='col s12'>
    <div class='card'>
      <div class='card-image'>
        <img src='${urlToImage}'>
        <span class='card-title'>${title || ''}</span>
      </div>
      <div class='card-content'>
      <p>${description || ''}</p>
      </div>
      <div class='card-action'>
        <a href='${url}'>Read more</a>
      </div>
    </div>
  </div>
  `
}

//Create message wrap
function showAlert(msg, type = 'success') {
  M.toast({html: msg, classes: type});
} 

//Show loader function
function showLoader() {
  document.body.insertAdjacentHTML('afterbegin',
  `<div class="progress">
    <div class="indeterminate"></div>
  </div>
  `
  )
}

//Remove loader function
function removeLoader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }

}