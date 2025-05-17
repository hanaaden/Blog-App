import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './home.css';

function Home() {
  
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/getposts', { withCredentials: true })
      .then(response => {
        setPosts(response.data);
        console.log(response.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div>
        {
          posts.map(post => {
            
            const imageUrl = `http://localhost:3001/${post.file}`; // Directly use the file path

            return (
              <Link to={`/post/${post._id}`} key={post._id} className='post'> {/* Use backticks for template literals */}
                <div >
                  <img src={imageUrl} alt={post.title} />
                  <div className='post-text'>
                    <h3>{post.title}</h3>
                    <p>Read more about  <b>{post.title}</b> (you can click anywhere is the post) </p>
                    {/* <p>{post.shortDescription}</p> */}
                  </div>
                </div>
              </Link>
            );
          })
        }
      </div>
    </div>
  );
}

export default Home;