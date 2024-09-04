// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 0.8, // Control the duration of the scroll
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing function
  smoothWheel: true, // Smooth scroll with mouse wheel
  smoothTouch: false, // Disable smooth scroll for touch devices (optional)
  wheelMultiplier: 1.1, // Increase this value to make scrolling faster
});

// RAF loop for Lenis to work correctly
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Image parallax animation
document.querySelectorAll("img").forEach((img) => {
  gsap.set(img, { scale: 1.2, y: 25 }); // Set initial state

  gsap.to(img, {
    y: -25,
    ease: "linear",
    scrollTrigger: {
      trigger: img,
      start: "top bottom",
      scrub: 1,
      // markers: true // Uncomment to see start/end points
    }
  });
});

// Navbar hide on scroll
let lastScrollTop = 0;
const navbarDesktop = document.querySelector('.navbar-desktop');

window.addEventListener('scroll', function () {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling down
    navbarDesktop.style.top = '-100px'; // Adjust as needed
  } else {
    // Scrolling up
    navbarDesktop.style.top = '0';
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile/negative scrolling
});

// Mobile menu close function
function closeMobileMenu() {
  const menuWrapper = document.querySelector(".menu-wrapper");

  document.querySelector('.menu-btn').classList.remove('open');

  gsap.to("#menu-text", {
    y: 0,
    rotationX: 0,
    opacity: 1,
    duration: 0.8,
    ease: "expo.inOut"
  });

  gsap.to("#close-text", {
    y: 20,
    rotationX: 90,
    duration: 0.8,
    ease: "expo.inOut"
  });

  gsap.to(menuWrapper, {
    width: "0vw",
    duration: 0.8,
    ease: "expo.inOut",
  });

  gsap.to(".menu-links a", {
    opacity: 0,
    duration: 1,
    ease: "expo.inOut",
    stagger: 0.05,
  });
}

// Mobile menu toggle button
document.querySelector(".menu-btn").addEventListener("click", function () {
  const menuWrapper = document.querySelector(".menu-wrapper");
  const isOpen = this.classList.toggle("open");

  if (isOpen) {
    gsap.to("#menu-text", {
      y: -22,
      rotationX: -90,
      duration: 0.8,
      ease: "expo.inOut"
    });

    gsap.to("#close-text", {
      y: 0,
      rotationX: 0,
      opacity: 1,
      duration: 0.8,
      ease: "expo.inOut"
    });

    gsap.to(menuWrapper, {
      width: "100vw",
      duration: 0.8,
      ease: "expo.inOut"
    });

    gsap.to(".menu-links a", {
      opacity: 1,
      duration: 1,
      ease: "bounce",
      stagger: 0.05,
    });
  } else {
    closeMobileMenu(); // Close menu if already open
  }
});

// Navbar link scroll animation
const navbarLinks = document.querySelectorAll('.navbar-links a, .menu-links a');

navbarLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });

    if (this.closest('.menu-links')) {
      closeMobileMenu(); // Close menu on mobile
    }
  });
});

// "Know More" button scroll animation
const knowMoreBtn = document.querySelector('.hero-btn');

knowMoreBtn.addEventListener('click', function (e) {
  e.preventDefault();
  document.querySelector('#about-section').scrollIntoView({ behavior: 'smooth' });
  closeMobileMenu();
});

// SVG rotation in heading
gsap.to(".ab-heading svg", {
  rotation: 500,
  duration: 1,
  ease: "expo.out",
  scrollTrigger: {
    trigger: ".ab-heading",
    start: "top bottom",
    end: "1000% bottom",
    scrub: 1,
    // markers: true
  }
});

// Marquee animation
const wrappers = document.querySelectorAll(".wrapper");

wrappers.forEach((wrapper) => {
  const boxes = gsap.utils.toArray(wrapper.querySelectorAll(".box"));
  const loop = horizontalLoop(boxes, { paused: false, repeat: -1 });
});

function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};

  let tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
  });

  let length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      xPercents = [],
      curIndex = 0,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1),
      totalWidth;

  gsap.set(items, {
    xPercent: (i, el) => {
      let w = (widths[i] = parseFloat(gsap.getProperty(el, "width", "px")));
      xPercents[i] = snap((parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 + gsap.getProperty(el, "xPercent"));
      return xPercents[i];
    },
  });

  totalWidth = items[length - 1].offsetLeft + (xPercents[length - 1] / 100) * widths[length - 1] - startX +
    items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") + (parseFloat(config.paddingRight) || 0);

  items.forEach((item, i) => {
    let curX = (xPercents[i] / 100) * widths[i];
    let distanceToStart = item.offsetLeft + curX - startX;
    let distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");

    tl.to(item, {
      xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
      duration: distanceToLoop / pixelsPerSecond,
    }, 0).fromTo(item, {
      xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
    }, {
      xPercent: xPercents[i],
      duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
      immediateRender: false,
    }, distanceToLoop / pixelsPerSecond);

    times[i] = distanceToStart / pixelsPerSecond;
  });

  function toIndex(index, vars) {
    vars = vars || {};
    if (Math.abs(index - curIndex) > length / 2) index += index > curIndex ? -length : length;
    let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next = (vars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index, vars) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true);

  if (config.reversed) {
    tl.vars.onReverseComplete();
    tl.reverse();
  }

  return tl;
}

// SVG animation in project info section
gsap.to(".pr-info svg", {
  x: "230%",
  rotation: 360,
  ease: "linear",
  duration: 50,
  scrollTrigger: {
    trigger: ".pr-info svg",
    start: "top center",
    end: "300% bottom",
    scrub: 1,
    // markers: true
  }
});

// Footer animation
let footer = new SplitType('.com-name span', {
  types: 'lines, words, chars',
  tagName: 'span'
});

gsap.from('.com-name span .char', {
  y: '100%',
  rotation: 10,
  duration: 2,
  ease: 'expo.out',
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.footer',
    start: 'top bottom',
  }
});
