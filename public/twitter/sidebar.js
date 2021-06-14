document.write(`
<div class="topnav" id="myTopnav">
    <a href="/" class="title-icon"><i class="fas fa-tractor"></i></a>
    <a href="/twitter/about">About</a>
    <a href="/twitter/daily">Daily Trends</a>
    <a href="/twitter/weekly">Weekly Trends</a>
    <a href="/twitter/recent">Most Recent Snapshot</a>

    <div class="theme-switch-wrapper">
        <label class="theme-switch" for="checkbox">
            <input type="checkbox" id="checkbox"/>
            <div class="slider round"></div>
      </label>
    </div>

    <a href="javascript:void(0);" class="icon" onclick="myFunction()">
        <i class="fa fa-ellipsis-h"></i>
    </a>
</div>
`)

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
} 

// const background = document.getElementById('wrapper');
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); //add this
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); //add this
    }

    // background.toggleClass("active")
}

toggleSwitch.addEventListener('change', switchTheme, false);
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}
