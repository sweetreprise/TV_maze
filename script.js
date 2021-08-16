/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
//sends request to get shows, and pushes data into an array
async function searchShows(query) {
  const movieData = [];
  const response = await axios.get(`https://api.tvmaze.com/search/shows`, { params: { q: query }})
  for (let movie of response.data) {
    if(movie.show.image === null) {
      movie.show.image = 'https://i.stack.imgur.com/y9DpT.jpg';
    }
    movieData.push({
      id: movie.show.id,
      name: movie.show.name,
      summary: movie.show.summary,
      image: movie.show.image.medium
    });
  }
  return movieData;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <img class="card-img-top" src="${show.image}">
             <p class="card-text">${show.summary}</p>
             <button type="button" class="btn btn-info btn-lg reveal-eps" data-toggle="modal" data-target="#episode-modal">Episodes</button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($item);
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

// sends request to get episodes of a show using particular show id
async function getEpisodes(id) {
  const episodeData = [];
  const response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  for(let episode of response.data) {
    episodeData.push({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    });
  }
  return episodeData;
}

//appends episodes to episodes-list UL, adds a modal to display episodes
function populateEpisodes(episodes) {
  const $episodesList = $('#episodes-list');
  $episodesList.empty();

  for(let episode of episodes) {
    let $ep = $(`<li>${episode.name} (Season: ${episode.season}, Ep: ${episode.number})</li>`);
    $episodesList.append($ep);
  }
  let $episodeModal = $(` 
  <div class="modal fade" id="episode-modal" role="dialog">
    <div class="modal-dialog">
  
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">Episodes</h4>
        </div>
        <div class="modal-body">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
    
    </div>
  </div>`)
  $('#episodes-area').append($episodeModal);
  $('.modal-body').append($episodesList);
  $('#episodes-area').show();
}

//listens for a click on the reveal-eps button on our shows-list div, then populates the episodes
$("#shows-list").on('click', '.reveal-eps', async function revealEpisodes(e) {
    let id = $(e.target).closest(".card").data("show-id");
    let episodes = await getEpisodes(id);
    populateEpisodes(episodes);
});