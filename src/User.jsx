import React, { useEffect, useState } from "react";
import "./User.css"; // Ensure this file has necessary styles
import axios from "axios";

function Movies() {
  // State variables for movies and pagination
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [toggleState, setToggleState] = useState(0); // 0: closed, 1: add, 2: edit
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [rating, setRating] = useState("");
  const [movieId, setMovieId] = useState("");

  // Filter state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterReleaseDate, setFilterReleaseDate] = useState("");
  const [filterRating, setFilterRating] = useState("");

  // Pagination state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Requires backend support
  const [sortOption, setSortOption] = useState(""); // e.g., 'title', 'rating'

  axios.defaults.withCredentials = true;

  // Fetch movies on component mount and when currentPage or sortOption changes
  useEffect(() => {
    fetchMovies(currentPage, sortOption);
  }, [currentPage, sortOption]);

  // Fetch movies from the backend with pagination and sorting
  const fetchMovies = (page, sort) => {
    axios
      .post(
        "https://app-backend-nu.vercel.app/paginate",
        {
          page: page,
          sort: sort,
        },
        { withCredentials: true }
      )
      .then((result) => {
        if (result.data.success) {
          setMovies(result.data.data);
          setFilteredMovies(result.data.data);
          setTotalPages(result.data.totalPages || 1); // Update total pages if provided
        } else {
          console.error("Failed to fetch movies:", result.data.msg);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  // Handle Delete Movie
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      axios
        .delete(`https://app-backend-nu.vercel.app/deleteMovie/${id}`)
        .then((res) => {
          console.log(res);
          // After deletion, refetch the current page
          fetchMovies(currentPage, sortOption);
        })
        .catch((err) => console.log(err));
    }
  };

  // Handle Create Movie
  const handleSubmitCreate = (e) => {
    e.preventDefault();
    axios
      .post("https://app-backend-nu.vercel.app/createMovie", {
        title,
        genre,
        release_date: releaseDate,
        rating: parseFloat(rating),
      })
      .then((result) => {
        console.log(result);
        // After creation, refetch the first page to see the new movie
        setCurrentPage(1);
        fetchMovies(1, sortOption);
        setToggleState(0);
        // Clear form fields
        setTitle("");
        setGenre("");
        setReleaseDate("");
        setRating("");
      })
      .catch((err) => console.log(err));
  };

  // Handle Update Movie
  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    axios
      .put(`https://app-backend-nu.vercel.app/updateMovie/${movieId}`, {
        title,
        genre,
        release_date: releaseDate,
        rating: parseFloat(rating),
      })
      .then((result) => {
        console.log(result);
        // After update, refetch the current page
        fetchMovies(currentPage, sortOption);
        setToggleState(0);
        // Clear form fields
        setTitle("");
        setGenre("");
        setReleaseDate("");
        setRating("");
      })
      .catch((err) => console.log(err));
  };

  // Function to open add or edit modal
  const toggleTab = (state) => {
    setToggleState(state);
    if (state === 0) {
      // Clear form fields when closing modal
      setTitle("");
      setGenre("");
      setReleaseDate("");
      setRating("");
      setMovieId("");
    }
  };

  // Handle Filtering (client-side)
  useEffect(() => {
    filterMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterGenre, filterReleaseDate, filterRating, movies]);

  const filterMovies = () => {
    let filtered = movies;

    // General search (Title or Genre)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query) ||
          movie.genre.toLowerCase().includes(query)
      );
    }

    // Filter by Genre
    if (filterGenre) {
      filtered = filtered.filter((movie) => movie.genre === filterGenre);
    }

    // Filter by Release Date (e.g., movies released on or after the selected date)
    if (filterReleaseDate) {
      const selectedDate = new Date(filterReleaseDate);
      filtered = filtered.filter(
        (movie) => new Date(movie.release_date) >= selectedDate
      );
    }

    // Filter by Rating (e.g., movies with rating greater than or equal to filterRating)
    if (filterRating) {
      const ratingValue = parseFloat(filterRating);
      if (!isNaN(ratingValue)) {
        filtered = filtered.filter((movie) => movie.rating >= ratingValue);
      }
    }

    setFilteredMovies(filtered);
  };

  // Handle Reset Filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilterGenre("");
    setFilterReleaseDate("");
    setFilterRating("");
  };

  // Handle Page Navigation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle Sorting Change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  return (
    <>
      <div className="head">
        <h1>MovieVerse</h1>
      </div>

      {/* Header with Add Button and Sort Options */}
      <header className="header">
        <button
          className="add-btn"
          onClick={() => toggleTab(1)}
        >
          + Add Movie
        </button>
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="sort-select"
        >
          <option value="">Sort By</option>
          <option value="title">Title (A-Z)</option>
          <option value="rating">Rating (Low to High)</option>
          {/* Add more sort options as needed */}
        </select>
      </header>

      {/* Filter Section */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by Title or Genre"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="filter-select"
        >
          <option value="">All Genres</option>
          {/* Dynamically populate genres based on available data */}
          {[...new Set(movies.map((movie) => movie.genre))].map((genre) => (
            <option
              key={genre}
              value={genre}
            >
              {genre}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterReleaseDate}
          onChange={(e) => setFilterReleaseDate(e.target.value)}
          className="filter-input"
        />

        <input
          type="number"
          placeholder="Rating ≥"
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="filter-input"
          step="0.1"
          min="0"
          max="10"
        />

        <button
          onClick={resetFilters}
          className="reset-btn"
        >
          Reset Filters
        </button>
      </div>

      {/* Display Movies as a Table */}
      <div className="table-container">
        <table className="movies-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Genre</th>
              <th>Release Date</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.map((movie) => (
              <tr key={movie._id}>
                <td>
                  <b>{movie.title}</b>
                </td>
                <td>
                  <b>{movie.genre}</b>
                </td>
                <td>
                  <b>{new Date(movie.release_date).toLocaleDateString()}</b>
                </td>
                <td>
                  <b>{movie.rating}</b>
                </td>
                <td>
                  <button
                    className="table-btn edit-btn"
                    onClick={() => {
                      setTitle(movie.title);
                      setGenre(movie.genre);
                      setReleaseDate(movie.release_date);
                      setRating(movie.rating);
                      setMovieId(movie._id);
                      toggleTab(2);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="table-btn delete-btn"
                    onClick={() => handleDelete(movie._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {/* Show a message if no movies match the filters */}
            {filteredMovies.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="no-movies"
                >
                  No movies match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-container">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="previouspagination-btn"
        >
          Previous
        </button>
        <span className="current-page">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="nextpagination-btn"
        >
          Next
        </button>
      </div>

      {/* Modal for Adding Movie */}
      <div
        className={
          toggleState === 1 ? "services_modal active-modal" : "services_modal"
        }
      >
        <div className="services_modal-content">
          <h3 className="services_modal-title">Add Movie</h3>

          <form onSubmit={handleSubmitCreate}>
            <div className="mb-2">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                placeholder="Enter Movie Title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="genre">Genre</label>
              <input
                type="text"
                id="genre"
                placeholder="Enter Genre"
                className="form-control"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="releaseDate">Release Date</label>
              <input
                type="date"
                id="releaseDate"
                className="form-control"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="rating">Rating</label>
              <input
                type="number"
                id="rating"
                placeholder="Enter Rating (e.g., 8.5)"
                className="form-control"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                step="0.1"
                min="0"
                max="10"
                required
              />
            </div>
            <button
              type="submit"
              className="input-btn"
            >
              ADD
            </button>
            <button
              type="button"
              onClick={() => toggleTab(0)}
              className="close-btn"
            >
              CLOSE
            </button>
          </form>
        </div>
      </div>

      {/* Modal for Updating Movie */}
      <div
        className={
          toggleState === 2 ? "services_modal active-modal" : "services_modal"
        }
      >
        <div className="services_modal-content">
          <h3 className="services_modal-title">Update Movie</h3>

          <form onSubmit={handleSubmitUpdate}>
            <div className="mb-2">
              <label htmlFor="updateTitle">Title</label>
              <input
                type="text"
                id="updateTitle"
                placeholder="Enter Movie Title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="updateGenre">Genre</label>
              <input
                type="text"
                id="updateGenre"
                placeholder="Enter Genre"
                className="form-control"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="updateReleaseDate">Release Date</label>
              <input
                type="date"
                id="updateReleaseDate"
                className="form-control"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="updateRating">Rating</label>
              <input
                type="number"
                id="updateRating"
                placeholder="Enter Rating (e.g., 8.5)"
                className="form-control"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                step="0.1"
                min="0"
                max="10"
                required
              />
            </div>
            <button
              type="submit"
              className="input-btn"
            >
              SUBMIT
            </button>
            <button
              type="button"
              onClick={() => toggleTab(0)}
              className="close-btn"
            >
              CLOSE
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Movies;
