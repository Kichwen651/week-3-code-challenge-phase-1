document.addEventListener('DOMContentLoaded', () => {
    const filmsList = document.getElementById('films');
    const movieDetails = document.getElementById('movie-details');
    const buyTicketBtn = document.getElementById('buy-ticket-btn');

    let currentMovie = null;

    // Fetch and display the first movie's details
    fetch('http://localhost:3000/films/1')
        .then(response => response.json())
        .then(data => {
            currentMovie = data;
            displayMovieDetails(data);
        })
        .catch(error => console.error('Error fetching first movie:', error));

    // Fetch and display the list of all movies
    fetch('http://localhost:3000/films')
        .then(response => response.json())
        .then(movies => displayMoviesInMenu(movies))
        .catch(error => console.error('Error fetching movie list:', error));

    // Function to display movie details
    function displayMovieDetails(movie) {
        const poster = document.getElementById('poster');
        const title = document.getElementById('title');
        const runtime = document.getElementById('runtime');
        const showtime = document.getElementById('showtime');
        const availableTickets = document.getElementById('ticket-num');

        poster.src = movie.poster;
        title.textContent = movie.title;
        runtime.textContent =` Runtime: ${movie.runtime} minutes`;
        showtime.textContent =` Showtime: ${movie.showtime}`;
        const ticketsAvailable = movie.capacity - movie.tickets_sold;
        availableTickets.textContent = `Available Tickets: ${ticketsAvailable}`;

        // Change the button text to "Sold Out" if no tickets are available
        buyTicketBtn.textContent = ticketsAvailable > 0 ? 'Buy Ticket' : 'Sold Out';
        buyTicketBtn.disabled = ticketsAvailable <= 0;
    }

    // Function to display movies in the list
    function displayMoviesInMenu(movies) {
        filmsList.innerHTML = ''; // Clear any existing movies

        movies.forEach(movie => {
            const li = document.createElement('li');
            li.textContent = movie.title;
            li.classList.add('film', 'item');
            filmsList.appendChild(li);

            // Add click event to display movie details
            li.addEventListener('click', () => {
                fetch(`http://localhost:3000/films/${movie.id}`)
                    .then(response => response.json())
                    .then(data => {
                        currentMovie = data;
                        displayMovieDetails(data);
                    })
                    .catch(error => console.error('Error fetching movie details:', error));
            });

            // Add a delete button to each movie item
            addDeleteButton(li, movie.id);
        });
    }

    // Function to handle buying a ticket
    function buyTicketForMovie(movie) {
        const ticketsAvailable = movie.capacity - movie.tickets_sold;
    
        // Proceed only if there are tickets available
        if (ticketsAvailable > 0) {
            console.log('Buying ticket for movie:', movie.title);
            console.log('Current tickets sold:', movie.tickets_sold);
    
            fetch(`http://localhost:3000/films/${movie.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tickets_sold: movie.tickets_sold + 1 }),
            })
                .then(response => {
                    console.log('Response Status:', response.status); 
                    if (!response.ok) {
                        throw new Error('Failed to update tickets');
                    }
                    return response.json();
                })
                .then(updatedMovie => {
                    console.log('Updated Movie:', updatedMovie);
                    currentMovie = updatedMovie; 
                    displayMovieDetails(updatedMovie);  
                })
                .catch(error => {
                    console.error('Error updating tickets:', error);
                    alert('Could not buy ticket. Please try again.');
                });
        } else {
            alert('This show is sold out!');
        }
    }
    buyTicketForMovie()
//     function buyTicket() {
//         const button = document.getElementById('buy-ticket');
//         const movieId = button.getAttribute('data-id');
      
//         fetch(`http://localhost:3000/films/${movie.id}`)
//           .then(response => response.json())
//           .then(movie => {
//             const remainingTickets = movie.capacity - movie.tickets_sold;
      
//             if (remainingTickets > 0) {
//               const updatedTicketsSold = movie.tickets_sold + 1;
      
//               // Update the number of tickets sold on the server
//               fetch(`http://localhost:3000/films/${movie.id}`, {
//                 method: 'PATCH',
//                 headers: {
//                   'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ tickets_sold: updatedTicketsSold }),
//               })
//                 .then(response => response.json())
//                 .then(updatedMovie => {
//                   displayMovieDetails(updatedMovie);
//                   getAllMovies(); // Refresh the list
//                 });
//             }
//           });
//       }
    
//       buyTicket() 
    // Function to add a delete button to each movie item
    function addDeleteButton(li, movieId) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        li.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation(); 
            deleteMovie(movieId, li);
        });
    }

    // Function to delete a movie
    function deleteMovie(movieId, li) {
        fetch(`http://localhost:3000/films/${movieId}`, {
            method: 'DELETE',
        })
            .then(() => {
                li.remove(); 
                console.log(`Movie with ID ${movieId} deleted`);
            })
            .catch(error => console.error('Error deleting movie:', error));
    }
});