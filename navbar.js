document.addEventListener('DOMContentLoaded', () => {
    const navbar = `

    <nav class="navbar">
        
        <div class="home-icon" >
          <img width="70px" src="assets/bookgif.gif" alt="">
          <h1>BookQuest</h1>
        </div>
        
    
        
        <ul class="nav-links">
          <li><a href="index.html">Search</a></li>
         
          <li><a href="mylibrary.html">My Library</a></li>
          
        </ul>
      </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', navbar);
  });