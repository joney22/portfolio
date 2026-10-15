const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const toast = document.getElementById('toast');
const projectSearch = document.getElementById('projectSearch');
const searchStatus = document.getElementById('searchStatus');
const filterButtons = [...document.querySelectorAll('.filter-btn')];
const projectCards = [...document.querySelectorAll('.project-card')];

document.getElementById('year').textContent = new Date().getFullYear();

function applyTheme(theme) {
  if (theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
  themeIcon.textContent = theme === 'light' ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  try { localStorage.setItem('portfolio-theme', theme); } catch (_) {}
}
let savedTheme = 'dark';
try { savedTheme = localStorage.getItem('portfolio-theme') || 'dark'; } catch (_) {}
applyTheme(savedTheme);
themeToggle.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
});

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Search and category filters work together.
let activeFilter = 'all';
function updateProjects() {
  const query = projectSearch.value.trim().toLowerCase();
  let count = 0;
  projectCards.forEach(card => {
    const searchable = [
      card.dataset.title, card.dataset.description, card.dataset.stack,
      card.dataset.status, card.dataset.category, card.textContent
    ].join(' ').toLowerCase();
    const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = !query || searchable.includes(query);
    const visible = matchesFilter && matchesSearch;
    card.classList.toggle('hidden', !visible);
    if (visible) count++;
  });
  searchStatus.textContent = count === 0
    ? 'No projects found. Try another keyword or category.'
    : `Showing ${count} project${count === 1 ? '' : 's'}.`;
}
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    updateProjects();
  });
});
projectSearch.addEventListener('input', updateProjects);
projectSearch.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    const firstVisible = projectCards.find(card => !card.classList.contains('hidden'));
    if (firstVisible) firstVisible.querySelector('.project-open').focus();
  }
});

// Accessible project detail dialog
const modal = document.getElementById('projectModal');
const closeModal = () => modal.close();
projectCards.forEach(card => {
  card.querySelector('.project-open').addEventListener('click', () => {
    document.getElementById('modalNumber').textContent = `PROJECT ${card.dataset.number} / DETAILS`;
    document.getElementById('modalTitle').textContent = card.dataset.title;
    document.getElementById('modalDescription').textContent = card.dataset.description;
    document.getElementById('modalStack').textContent = card.dataset.stack;
    document.getElementById('modalStatus').textContent = card.dataset.status;
    modal.showModal();
  });
});
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalDone').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });

// Contact form: validates locally and opens a prefilled email draft.
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const portfolioEmail = 'your.email@example.com'; // Replace this with your real email.
contactForm.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('invalid');
    formFeedback.textContent = '';
    formFeedback.classList.remove('error');
  });
});
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('contactName');
  const email = document.getElementById('contactEmail');
  const message = document.getElementById('contactMessage');
  const fields = [name, email, message];
  fields.forEach(field => field.classList.remove('invalid'));
  const invalid = fields.filter(field => !field.checkValidity());
  if (invalid.length) {
    invalid.forEach(field => field.classList.add('invalid'));
    formFeedback.textContent = 'Please enter a valid name, email address, and message (at least 10 characters).';
    formFeedback.classList.add('error');
    invalid[0].focus();
    return;
  }
  const subject = `Portfolio inquiry from ${name.value.trim()}`;
  const body = `Name: ${name.value.trim()}\nReply email: ${email.value.trim()}\n\nMessage:\n${message.value.trim()}`;
  formFeedback.textContent = 'Opening your email app with a prepared message…';
  formFeedback.classList.remove('error');
  window.location.href = `mailto:${portfolioEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById('copyEmail').addEventListener('click', async event => {
  const email = event.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    showToast('Email address copied');
  } catch (_) {
    formFeedback.textContent = 'Your email address is: ' + email;
    formFeedback.classList.remove('error');
    showToast('Email address shown in the form area');
  }
});

// Scroll progress and back-to-top button
const progressBar = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
  backToTop.classList.toggle('visible', window.scrollY > 500);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);
updateScrollUI();
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2300);
}

// Reveal content as it enters the viewport; support reduced-motion and older browsers.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}
