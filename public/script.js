// Frontend script for Course Stack
const API_BASE = '/api/v1'

// Configure axios
axios.defaults.baseURL = API_BASE

function setAuthToken(token){
  if(token){
    localStorage.setItem('cs_token', token)
    axios.defaults.headers.common['token'] = token
    document.getElementById('btn-logout').style.display = 'inline-block'
    document.getElementById('btn-login').style.display = 'none'
  } else {
    localStorage.removeItem('cs_token')
    delete axios.defaults.headers.common['token']
    document.getElementById('btn-logout').style.display = 'none'
    document.getElementById('btn-login').style.display = 'inline-block'
  }
}

function getToken(){
  return localStorage.getItem('cs_token')
}

async function loadCourses(){
  try{
    const res = await axios.get('/course/preview')
    const courses = res.data.courses || []
    renderCourses(courses)
  }catch(err){
    console.error(err)
    showToast('Failed to load courses')
  }
}

function renderCourses(courses){
  const grid = document.getElementById('coursesGrid')
  grid.innerHTML = ''
  courses.forEach(c => {
    const card = document.createElement('div')
    card.className = 'card'
    const imgUrl = c.imageUrl || 'https://picsum.photos/seed/'+c._id+'/400/200'
    card.innerHTML = `
      <div class="card-image" style="background-image:url('${imgUrl}')"></div>
      <h3>${escapeHtml(c.title || 'Untitled')}</h3>
      <p>${escapeHtml(c.description || '')}</p>
      <div class="meta">
        <div class="price">$${c.price ?? 0}</div>
        <div>
          <button class="btn btn-primary" onclick="enrollCourse('${c._id}')">Enroll</button>
        </div>
      </div>
    `
    grid.appendChild(card)
  })
}

async function enrollCourse(courseId){
  const token = getToken()
  if(!token){
    openAuthModal('signin')
    showToast('Please sign in to enroll')
    return
  }
  try{
    await axios.post('/course/purchase', { courseId })
    showToast('Enrollment successful', true)
  }catch(err){
    console.error(err)
    showToast(err.response?.data?.message || 'Enrollment failed')
  }
}

async function loadMyCourses(){
  const token = getToken()
  if(!token){
    showToast('Sign in to see your courses')
    return
  }
  try{
    const res = await axios.get('/user/purchases')
    const courses = res.data.course || []
    const grid = document.getElementById('myCoursesGrid')
    grid.innerHTML = ''
    courses.forEach(c => {
      const card = document.createElement('div')
      card.className = 'card'
      const imgUrl = c.imageUrl || 'https://picsum.photos/seed/'+c._id+'/400/200'
      card.innerHTML = `
        <div class="card-image" style="background-image:url('${imgUrl}')"></div>
        <h3>${escapeHtml(c.title || 'Untitled')}</h3>
        <p>${escapeHtml(c.description || '')}</p>
        <div class="meta">
          <div class="price">$${c.price ?? 0}</div>
        </div>
      `
      grid.appendChild(card)
    })
  }catch(err){
    console.error(err)
    showToast('Failed to load your courses')
  }
}

// simple XSS escape
function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;')
}

// Toast
let toastTimer = null
function showToast(msg, success){
  clearTimeout(toastTimer)
  const t = document.getElementById('__toast') || (function(){ const el = document.createElement('div'); el.id='__toast'; el.style.position='fixed'; el.style.right='18px'; el.style.bottom='18px'; el.style.padding='12px 16px'; el.style.borderRadius='8px'; el.style.boxShadow='0 6px 20px rgba(2,6,23,0.12)'; el.style.color='#fff'; el.style.zIndex=9999; document.body.appendChild(el); return el })()
  t.style.background = success ? '#16a34a' : '#111827'
  t.textContent = msg
  t.style.opacity = '1'
  toastTimer = setTimeout(()=>{ t.style.opacity='0' }, 3000)
}

// Auth modal and flows
function openAuthModal(mode='signin'){
  const modal = document.getElementById('authModal')
  modal.setAttribute('aria-hidden','false')
  document.getElementById('authTitle').textContent = mode === 'signup' ? 'Create account' : 'Sign in'
  document.getElementById('nameRow').style.display = mode === 'signup' ? 'flex' : 'none'
  document.getElementById('authSubmit').textContent = mode === 'signup' ? 'Create account' : 'Continue'
  modal.dataset.mode = mode
}
function closeAuthModal(){
  const modal = document.getElementById('authModal')
  modal.setAttribute('aria-hidden','true')
}

async function submitAuthForm(e){
  e.preventDefault()
  const mode = document.getElementById('authModal').dataset.mode || 'signin'
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const firstName = document.getElementById('firstName').value
  const lastName = document.getElementById('lastName').value
  try{
    if(mode === 'signup'){
      await axios.post('/user/signup', { email, password, firstName, lastName })
      showToast('Account created — please sign in', true)
      openAuthModal('signin')
    } else {
      const res = await axios.post('/user/signin', { email, password })
      const token = res.data.token
      if(token){
        setAuthToken(token)
        closeAuthModal()
        loadMyCourses()
        showToast('Signed in', true)
      } else {
        showToast('Sign in failed')
      }
    }
  }catch(err){
    console.error(err)
    showToast(err.response?.data?.message || 'Auth failed')
  }
}

function logout(){
  setAuthToken(null)
  showToast('Signed out')
}

// wire up UI
document.addEventListener('DOMContentLoaded', ()=>{
  // auth buttons
  document.getElementById('btn-login').addEventListener('click', ()=>openAuthModal('signin'))
  document.getElementById('cta-signup').addEventListener('click', ()=>openAuthModal('signup'))
  document.getElementById('modalClose').addEventListener('click', closeAuthModal)
  document.getElementById('authForm').addEventListener('submit', submitAuthForm)
  document.getElementById('btn-logout').addEventListener('click', logout)

  document.getElementById('nav-courses').addEventListener('click', ()=>{ document.getElementById('courses-section').style.display='block'; document.getElementById('mycourses-section').style.display='none'; })
  document.getElementById('nav-my').addEventListener('click', ()=>{ document.getElementById('courses-section').style.display='none'; document.getElementById('mycourses-section').style.display='block'; loadMyCourses() })
  document.getElementById('cta-explore').addEventListener('click', ()=>{ document.getElementById('courses-section').scrollIntoView({behavior:'smooth'}) })
  document.getElementById('cta-signup').addEventListener('click', ()=>openAuthModal('signup'))

  // search
  document.getElementById('search').addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase()
    const cards = Array.from(document.querySelectorAll('#coursesGrid .card'))
    cards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || ''
      card.style.display = title.includes(q) ? 'flex' : 'none'
    })
  })

  // initialize token
  const token = getToken()
  if(token) setAuthToken(token)

  loadCourses()
})
