// ===================================
// MOBILE MENU TOGGLE
// ===================================

const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXTdo1mxDsjKKDYjw2_FaFhLpwcgqq0ImlNr738pW2vd4y15xi_FEhc3FOzlRGzx2Y6A/exec";

if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        
        // Change icon
        const icon = mobileMenuToggle.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// ===================================
// SMOOTH SCROLLING
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// FAQ ACCORDION
// ===================================

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Close all other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        item.classList.toggle('active');
    });
});

// ===================================
// FORM VALIDATION & SUBMISSION
// ===================================

const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            profile: document.getElementById('profile').value,
            nom: document.getElementById('nom').value,
            prenom: document.getElementById('prenom').value,
            email: document.getElementById('email').value,
            telephone: document.getElementById('telephone').value,
            ville: document.getElementById('ville').value,
            codePostal: document.getElementById('codePostal').value,
            message: document.getElementById('message').value,
            urgence: document.getElementById('urgence').checked,
            rgpd: document.getElementById('rgpd').checked,
            dateSubmission: new Date().toISOString()
        };
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showMessage('error', '⚠️ Veuillez entrer une adresse email valide.');
            return;
        }
        
        // Validate phone format (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        const phoneClean = formData.telephone.replace(/\s/g, '');
        if (!phoneRegex.test(phoneClean)) {
            showMessage('error', '⚠️ Veuillez entrer un numéro de téléphone valide (10 chiffres).');
            return;
        }
        
        // Check RGPD consent
        if (!formData.rgpd) {
            showMessage('error', '⚠️ Vous devez accepter que vos données soient utilisées pour vous recontacter.');
            return;
        }
        
        // Disable submit button during submission
        const submitButton = contactForm.querySelector('.btn-submit');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        
        try {
            // Envoi vers Google Apps Script (Google Sheets)
            const response = await fetch("https://script.google.com/macros/s/AKfycbxXTdo1mxDsjKKDYjw2_FaFhLpwcgqq0ImlNr738pW2vd4y15xi_FEhc3FOzlRGzx2Y6A/exec", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Erreur lors de l'enregistrement dans Google Sheets");
            }

            // Afficher message de succès
            showMessage('success', '✅ Merci pour votre demande ! Nous vous recontacterons sous 24h pour échanger sur votre situation et planifier l\'intervention.');

            // Reset form
            contactForm.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', '❌ Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer ou nous contacter directement par téléphone.');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// Function to display form messages
function showMessage(type, message) {
    formMessage.className = 'form-message ' + type;
    formMessage.textContent = message;
    formMessage.style.display = 'block';
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide success messages after 10 seconds
    if (type === 'success') {
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 10000);
    }
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================

let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow when scrolled
    if (currentScroll > 50) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// ===================================
// INTERSECTION OBSERVER - ANIMATIONS
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add animation to elements when they come into view
const animatedElements = document.querySelectorAll('.service-item, .step, .trust-item, .faq-item, .advantage-item');

animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
});

// ===================================
// FORM FIELD ANIMATIONS
// ===================================

const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');

formInputs.forEach(input => {
    // Add focus effect
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
        input.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
    
    // Real-time validation feedback
    if (input.type === 'email') {
        input.addEventListener('blur', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (input.value && !emailRegex.test(input.value)) {
                input.style.borderColor = '#dc3545';
            } else if (input.value) {
                input.style.borderColor = '#28a745';
            }
        });
    }
    
    if (input.id === 'telephone') {
        input.addEventListener('blur', () => {
            const phoneRegex = /^[0-9]{10}$/;
            const phoneClean = input.value.replace(/\s/g, '');
            if (input.value && !phoneRegex.test(phoneClean)) {
                input.style.borderColor = '#dc3545';
            } else if (input.value) {
                input.style.borderColor = '#28a745';
            }
        });
    }
    
    if (input.id === 'codePostal') {
    input.addEventListener('blur', () => {

        const code = input.value;
        const regex = /^[0-9]{5}$/;

        if (!regex.test(code)) {
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#28a745';
        }
    });
}
    
    // Reset border on input
    input.addEventListener('input', () => {
        if (input.style.borderColor !== '') {
            input.style.borderColor = '#cccccc';
        }
    });
});

// ===================================
// AUTO-FORMAT TELEPHONE
// ===================================

const telephoneInput = document.getElementById('telephone');

if (telephoneInput) {
    telephoneInput.addEventListener('input', (e) => {
        // Remove all non-digit characters
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        
        // Format as XX XX XX XX XX
        if (value.length > 0) {
            const formatted = value.match(/.{1,2}/g)?.join(' ') || value;
            e.target.value = formatted;
        }
    });
}

// ===================================
// SCROLL TO TOP BUTTON (optional enhancement)
// ===================================

// Create scroll to top button
const scrollTopButton = document.createElement('button');
scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopButton.className = 'scroll-to-top';
scrollTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #004d99 0%, #0066cc 100%);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 77, 153, 0.3);
    z-index: 999;
`;

document.body.appendChild(scrollTopButton);

// Show/hide button based on scroll position
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopButton.style.opacity = '1';
        scrollTopButton.style.visibility = 'visible';
    } else {
        scrollTopButton.style.opacity = '0';
        scrollTopButton.style.visibility = 'hidden';
    }
});

// Scroll to top on click
scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

scrollTopButton.addEventListener('mouseenter', () => {
    scrollTopButton.style.transform = 'translateY(-5px)';
    scrollTopButton.style.boxShadow = '0 6px 20px rgba(0, 77, 153, 0.4)';
});

scrollTopButton.addEventListener('mouseleave', () => {
    scrollTopButton.style.transform = 'translateY(0)';
    scrollTopButton.style.boxShadow = '0 4px 15px rgba(0, 77, 153, 0.3)';
});

// ===================================
// CONSOLE MESSAGE
// ===================================

console.log('%c🏠 Diagnostic Humidité Pro', 'color: #004d99; font-size: 24px; font-weight: bold;');
console.log('%cExpertise indépendante en diagnostic d\'humidité', 'color: #666; font-size: 14px;');
console.log('%cVal-de-Marne (94) et Seine-et-Marne (77)', 'color: #666; font-size: 14px;');