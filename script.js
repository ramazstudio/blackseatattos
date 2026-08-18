// ============================================================
// BLACK SEA TATTOO — JAVASCRIPT
// ============================================================

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('open');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// ===== SCROLL NAV EFFECT =====
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// ============================================================
// BOOKING CALENDAR
// ============================================================

const TIME_SLOTS = [];
for (let h = 10; h <= 20; h++) {
    const hour = h > 12 ? h - 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    TIME_SLOTS.push(`${hour}:00 ${ampm}`);
}

const bookings = {};

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDateStr = null;
let selectedTime = null;

const monthYearEl = document.getElementById('monthYear');
const calendarGrid = document.getElementById('calendarGrid');
const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const confirmationBox = document.getElementById('confirmationBox');
const confirmDate = document.getElementById('confirmDate');
const confirmTime = document.getElementById('confirmTime');
const cancelBtn = document.getElementById('cancelBooking');

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function formatDateKey(year, month, day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getBlockedSlots(dateKey) {
    return new Set(bookings[dateKey] || []);
}

function isSlotAvailable(dateKey, slot) {
    return !getBlockedSlots(dateKey).has(slot);
}

function getSelectedDateDisplay() {
    if (!selectedDateStr) return 'No date selected';
    const parts = selectedDateStr.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    const todayStr = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    monthYearEl.textContent = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    let html = '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(name => {
        html += `<div class="day-name">${name}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="day-btn empty"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = formatDateKey(currentYear, currentMonth, d);
        const isToday = dateKey === todayStr;
        const isSelected = dateKey === selectedDateStr;
        const thisDate = new Date(currentYear, currentMonth, d);
        const isPast = thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

        let classes = 'day-btn';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (isPast) classes += ' disabled';

        html += `<button class="${classes}" data-date="${dateKey}" ${isPast ? 'disabled' : ''}>${d}</button>`;
    }

    calendarGrid.innerHTML = html;

    document.querySelectorAll('.day-btn:not(.empty):not(.disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedDateStr = this.dataset.date;
            if (selectedDateDisplay) {
                selectedDateDisplay.textContent = getSelectedDateDisplay();
            }
            renderCalendar();
            renderTimeSlots();
            hideConfirmation();
        });
    });
}

function renderTimeSlots() {
    if (!timeSlotsContainer) return;

    if (!selectedDateStr) {
        timeSlotsContainer.innerHTML = `
            <div style="text-align:center; padding:30px 20px; color:#999;">
                <p style="margin:0;">Please select a date first</p>
            </div>
        `;
        return;
    }

    const blocked = getBlockedSlots(selectedDateStr);
    const booked = bookings[selectedDateStr] || [];

    let html = `<div class="time-slots">`;
    TIME_SLOTS.forEach(slot => {
        const isBlocked = blocked.has(slot);
        const isBooked = booked.includes(slot);
        const isSelected = selectedTime === slot && isBooked;

        let classes = 'time-btn';
        if (isBlocked) classes += ' blocked';
        if (isSelected) classes += ' selected-time';

        const label = isSelected ? `✓ ${slot}` : slot;

        html += `
            <button class="${classes}" data-time="${slot}" ${isBlocked ? 'disabled' : ''}>
                ${label}
            </button>
        `;
    });
    html += `</div>`;
    timeSlotsContainer.innerHTML = html;

    document.querySelectorAll('.time-btn:not(.blocked)').forEach(btn => {
        btn.addEventListener('click', function() {
            const slot = this.dataset.time;
            bookSlot(slot);
        });
    });
}

function bookSlot(slot) {
    if (!selectedDateStr) return;
    if (!isSlotAvailable(selectedDateStr, slot)) return;

    if (!bookings[selectedDateStr]) bookings[selectedDateStr] = [];
    bookings[selectedDateStr].push(slot);

    selectedTime = slot;
    renderTimeSlots();
    showConfirmation(slot);
}

function showConfirmation(slot) {
    if (!confirmationBox) return;
    const dateDisplay = getSelectedDateDisplay();
    if (confirmDate) confirmDate.textContent = dateDisplay;
    if (confirmTime) confirmTime.textContent = slot;
    confirmationBox.classList.add('show');
}

function hideConfirmation() {
    if (confirmationBox) confirmationBox.classList.remove('show');
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        if (!selectedDateStr || !selectedTime) return;

        if (bookings[selectedDateStr]) {
            bookings[selectedDateStr] = bookings[selectedDateStr].filter(s => s !== selectedTime);
            if (bookings[selectedDateStr].length === 0) {
                delete bookings[selectedDateStr];
            }
        }

        selectedTime = null;
        hideConfirmation();
        renderTimeSlots();
    });
}

document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
});

// ============================================================
// CONTACT FORM
// ============================================================

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('✅ Your message has been sent! We\'ll get back to you within 24 hours.');
        this.reset();
    });
}

// ============================================================
// BOOKING FORM
// ============================================================

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('fullName')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const idea = document.getElementById('tattooIdea')?.value || '';
        const date = document.getElementById('preferredDate')?.value || '';
        const time = document.getElementById('preferredTime')?.value || '';
        const size = document.getElementById('sizePlacement')?.value || '';
        const payment = document.getElementById('paymentMethod')?.value || '';
        const terms = document.getElementById('terms')?.checked || false;

        if (!name || !email || !phone || !idea || !date || !time || !payment || !terms) {
            alert('⚠️ Please fill in all required fields and agree to the terms.');
            return;
        }

        if (selectedDateStr && selectedTime) {
            if (!isSlotAvailable(selectedDateStr, selectedTime)) {
                alert('⚠️ Sorry, this time slot has just been taken. Please select another time.');
                renderTimeSlots();
                return;
            }
        }

        let message = `📋 New Booking Request!\n\n`;
        message += `Name: ${name}\n`;
        message += `Email: ${email}\n`;
        message += `Phone: ${phone}\n\n`;
        message += `Tattoo Idea: ${idea}\n`;
        message += `Preferred Date: ${date}\n`;
        message += `Preferred Time: ${time}\n`;
        message += `Size/Placement: ${size}\n\n`;
        message += `Payment Method: ${payment}\n\n`;

        if (payment === 'Gift Card') {
            const giftCardFile = document.getElementById('giftCardUpload')?.files[0];
            if (giftCardFile) {
                message += `Gift Card Image: ${giftCardFile.name}\n`;
            } else {
                alert('⚠️ Please upload a picture of your Gift Card.');
                return;
            }
        }

        const refFile = document.getElementById('referenceUpload')?.files[0];
        if (refFile) {
            message += `Reference Image: ${refFile.name}\n`;
        }

        alert(`✅ Booking request sent to tattoo.blacksee@gmail.com!\n\nWe'll get back to you within 24 hours.`);

        if (selectedDateStr && selectedTime) {
            if (!bookings[selectedDateStr]) bookings[selectedDateStr] = [];
            bookings[selectedDateStr].push(selectedTime);
        }

        this.reset();
        selectedTime = null;
        selectedDateStr = null;
        hideConfirmation();
        if (selectedDateDisplay) selectedDateDisplay.textContent = 'No date selected';
        renderCalendar();
        renderTimeSlots();
        document.getElementById('giftCardGroup').style.display = 'none';
    });
}

document.getElementById('paymentMethod')?.addEventListener('change', function() {
    const giftCardGroup = document.getElementById('giftCardGroup');
    if (this.value === 'Gift Card') {
        giftCardGroup.style.display = 'block';
    } else {
        giftCardGroup.style.display = 'none';
    }
});

// ===== INIT =====
renderCalendar();

const today = new Date();
const demoDate = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate() + 1);
bookings[demoDate] = ['11:00 AM', '2:00 PM', '4:00 PM'];

const defaultDate = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
if (todayDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    selectDate(defaultDate);
} else {
    const firstAvailable = formatDateKey(currentYear, currentMonth, 1);
    selectDate(firstAvailable);
}

function selectDate(dateKey) {
    selectedDateStr = dateKey;
    if (selectedDateDisplay) {
        selectedDateDisplay.textContent = getSelectedDateDisplay();
    }
    renderCalendar();
    renderTimeSlots();
    hideConfirmation();
}

console.log('🖤 Black Sea Tattoo — Premium Website Loaded');