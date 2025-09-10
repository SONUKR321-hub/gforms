// Form validation and interaction handlers
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const teamPreferenceSelect = document.getElementById('teamPreference');
    const partnerDetailsDiv = document.getElementById('partnerDetails');
    const submitBtn = document.querySelector('.submit-btn');
    const modal = document.getElementById('successModal');

    // Show/hide partner details based on team preference
    teamPreferenceSelect.addEventListener('change', function() {
        if (this.value === 'WithPartner') {
            partnerDetailsDiv.style.display = 'block';
            document.getElementById('partnerName').required = true;
        } else {
            partnerDetailsDiv.style.display = 'none';
            document.getElementById('partnerName').required = false;
            document.getElementById('partnerName').value = '';
        }
    });

    // Form validation functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,3}[\s]?[\d]{4,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    function validateTextLength(text, minLength) {
        return text.trim().length >= minLength;
    }

    function validateInterests() {
        const checkedInterests = document.querySelectorAll('input[name="interests"]:checked');
        return checkedInterests.length > 0;
    }

    // Real-time validation
    function addValidation(element, validationFn, errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
        errorDiv.style.display = 'none';
        element.parentNode.appendChild(errorDiv);

        function validate() {
            const isValid = validationFn(element.value);
            if (isValid) {
                element.classList.remove('error-input');
                element.classList.add('success-input');
                errorDiv.style.display = 'none';
            } else {
                element.classList.remove('success-input');
                element.classList.add('error-input');
                errorDiv.style.display = 'flex';
            }
            return isValid;
        }

        element.addEventListener('blur', validate);
        element.addEventListener('input', function() {
            if (element.classList.contains('error-input')) {
                validate();
            }
        });

        return validate;
    }

    // Add validation to form fields
    const emailValidator = addValidation(
        document.getElementById('email'),
        validateEmail,
        'Please enter a valid email address'
    );

    const phoneValidator = addValidation(
        document.getElementById('phone'),
        validatePhone,
        'Please enter a valid phone number'
    );

    const motivationValidator = addValidation(
        document.getElementById('motivation'),
        (text) => text.trim() === '' || validateTextLength(text, 50),
        'If provided, please write at least 50 characters'
    );

    // Interests validation
    const interestsCheckboxes = document.querySelectorAll('input[name="interests"]');
    const interestsErrorDiv = document.createElement('div');
    interestsErrorDiv.className = 'error-message';
    interestsErrorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please select at least one area of interest';
    interestsErrorDiv.style.display = 'none';
    document.querySelector('.checkbox-group').parentNode.appendChild(interestsErrorDiv);

    interestsCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const isValid = validateInterests();
            if (isValid) {
                interestsErrorDiv.style.display = 'none';
            } else {
                interestsErrorDiv.style.display = 'flex';
            }
        });
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isFormValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error-input');
                isFormValid = false;
            } else {
                field.classList.remove('error-input');
                field.classList.add('success-input');
            }
        });

        // Validate specific fields
        if (!emailValidator()) isFormValid = false;
        if (!phoneValidator()) isFormValid = false;
        // Motivation field is optional, only validate if it has content
        const motivationField = document.getElementById('motivation');
        if (motivationField.value.trim() !== '' && !motivationValidator()) isFormValid = false;
        if (!validateInterests()) {
            interestsErrorDiv.style.display = 'flex';
            isFormValid = false;
        }

        // Check agreement checkbox
        const agreementCheckbox = document.getElementById('agreement');
        if (!agreementCheckbox.checked) {
            agreementCheckbox.parentNode.classList.add('error-input');
            isFormValid = false;
        }

        if (!isFormValid) {
            // Scroll to first error
            const firstError = form.querySelector('.error-input');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Show loading state
        form.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Collect form data
            const formData = new FormData(form);
            const registrationData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                rollNumber: formData.get('rollNumber'),
                batch: formData.get('batch'),
                branch: formData.get('branch'),
                semester: formData.get('semester'),
                experience: formData.get('experience'),
                interests: formData.getAll('interests'),
                motivation: formData.get('motivation'),
                teamPreference: formData.get('teamPreference'),
                partnerName: formData.get('partnerName'),
                preferredRole: formData.get('preferredRole'),
                achievements: formData.get('achievements'),
                specialRequirements: formData.get('specialRequirements'),
                newsletter: formData.get('newsletter') === 'on',
                timestamp: new Date().toISOString()
            };

            // Store in localStorage (in real app, send to server)
            const registrationId = 'MIT-DB-' + Date.now().toString(36).toUpperCase();
            try {
                // Ensure localStorage is available
                if (typeof localStorage === 'undefined') {
                    throw new Error('localStorage is not available');
                }
                
                // Store the data
                const storageKey = 'registration_' + registrationId;
                localStorage.setItem(storageKey, JSON.stringify(registrationData));
                
                // Verify data was stored correctly
                const storedData = localStorage.getItem(storageKey);
                if (!storedData) {
                    throw new Error('Failed to store data in localStorage');
                }
                
                console.log('Registration stored successfully with ID:', registrationId);
                
                // Show success modal
                document.getElementById('registrationId').textContent = registrationId;
                modal.style.display = 'block';
            } catch (error) {
                console.error('Storage error:', error);
                alert('There was an error saving your registration. Please try again or contact support.');
            }

            // Reset form
            form.reset();
            form.classList.remove('loading');
            submitBtn.disabled = false;

            // Remove validation classes
            form.querySelectorAll('.success-input, .error-input').forEach(el => {
                el.classList.remove('success-input', 'error-input');
            });

            // Hide partner details
            partnerDetailsDiv.style.display = 'none';

            console.log('Registration submitted:', registrationData);
        }, 2000);
    });

    // Modal close handler
    window.closeModal = function() {
        modal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Auto-resize textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });

    // Character counter for motivation field
    const motivationField = document.getElementById('motivation');
    const counterDiv = document.createElement('div');
    counterDiv.className = 'character-counter';
    counterDiv.style.cssText = 'font-size: 0.85rem; color: #718096; margin-top: 5px; text-align: right;';
    motivationField.parentNode.appendChild(counterDiv);

    motivationField.addEventListener('input', function() {
        const length = this.value.length;
        counterDiv.textContent = `${length}/500 characters (optional)`;
        
        if (length === 0 || length >= 50) {
            counterDiv.style.color = '#48bb78';
        } else {
            counterDiv.style.color = '#f56565';
        }
    });

    // Initialize character counter
    motivationField.dispatchEvent(new Event('input'));

    // Smooth scrolling for form sections
    const sectionHeaders = document.querySelectorAll('.form-section h3');
    sectionHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            this.parentNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Add floating labels effect
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentNode.classList.remove('focused');
            }
        });
        
        // Check if field has value on load
        if (input.value) {
            input.parentNode.classList.add('focused');
        }
    });

    // Progress indicator
    function updateProgress() {
        const totalFields = form.querySelectorAll('[required]').length;
        const filledFields = Array.from(form.querySelectorAll('[required]')).filter(field => {
            if (field.type === 'checkbox') {
                return field.checked;
            }
            return field.value.trim() !== '';
        }).length;
        
        const progress = Math.round((filledFields / totalFields) * 100);
        
        // Update progress bar if it exists
        let progressBar = document.querySelector('.progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = `
                <div class="progress-container">
                    <div class="progress-fill"></div>
                    <span class="progress-text">Form Progress: 0%</span>
                </div>
            `;
            progressBar.style.cssText = `
                position: sticky;
                top: 20px;
                z-index: 100;
                margin-bottom: 20px;
            `;
            
            const progressContainer = progressBar.querySelector('.progress-container');
            progressContainer.style.cssText = `
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                border-radius: 25px;
                padding: 15px 20px;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                position: relative;
                overflow: hidden;
            `;
            
            const progressFill = progressBar.querySelector('.progress-fill');
            progressFill.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 25px;
                transition: width 0.3s ease;
                width: 0%;
            `;
            
            const progressText = progressBar.querySelector('.progress-text');
            progressText.style.cssText = `
                position: relative;
                z-index: 1;
                font-weight: 600;
                color: #2d3748;
                text-align: center;
                display: block;
            `;
            
            form.insertBefore(progressBar, form.firstChild);
        }
        
        const progressFill = progressBar.querySelector('.progress-fill');
        const progressText = progressBar.querySelector('.progress-text');
        
        progressFill.style.width = progress + '%';
        progressText.textContent = `Form Progress: ${progress}%`;
        
        if (progress >= 100) {
            progressText.textContent = '✓ Form Complete - Ready to Submit!';
            progressText.style.color = '#48bb78';
        }
    }

    // Add progress tracking to all form inputs
    const allInputs = form.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('input', updateProgress);
        input.addEventListener('change', updateProgress);
    });

    // Initial progress update
    updateProgress();

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    console.log('Parliament Debate Competition Registration Form Initialized');
});

// Admin Authentication System
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

let isAdminAuthenticated = false;

// Show admin login modal
function showAdminLogin() {
    // Create modal if it doesn't exist
    let loginModal = document.getElementById('admin-login-modal');
    
    if (!loginModal) {
        loginModal = document.createElement('div');
        loginModal.id = 'admin-login-modal';
        loginModal.className = 'modal';
        loginModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <span class="close-btn" onclick="closeAdminLoginModal()">&times;</span>
                <h2>Admin Authentication</h2>
                <form id="admin-login-form">
                    <div class="form-group">
                        <label for="admin-username">Username</label>
                        <input type="text" id="admin-username" required>
                    </div>
                    <div class="form-group">
                        <label for="admin-password">Password</label>
                        <input type="password" id="admin-password" required>
                    </div>
                    <div class="form-group" style="margin-top: 20px;">
                        <button type="submit" class="submit-btn">Login</button>
                    </div>
                    <div id="login-error" class="error-message" style="display: none; color: #e53e3e; margin-top: 10px; text-align: center;"></div>
                </form>
            </div>
        `;
        document.body.appendChild(loginModal);
        
        // Add event listener to form
        document.getElementById('admin-login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            authenticateAdmin();
        });
    }
    
    loginModal.style.display = 'block';
    
    // Admin panel link handler
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        adminLink.addEventListener('click', function(e) {
            e.preventDefault();
            showAdminLogin();
        });
    }
}

// Close admin login modal
function closeAdminLoginModal() {
    const loginModal = document.getElementById('admin-login-modal');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
}

// Authenticate admin
function authenticateAdmin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const errorElement = document.getElementById('login-error');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminAuthenticated = true;
        closeAdminLoginModal();
        showAdminPanel();
        showNotification('Admin authentication successful', 'success');
    } else {
        errorElement.textContent = 'Invalid username or password';
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}

// Show admin panel after authentication
function showAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel && isAdminAuthenticated) {
        panel.classList.remove('hidden');
        updateResponsesCount();
    }
}

// Admin panel toggle function (only works if authenticated)
function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel && isAdminAuthenticated) {
        panel.classList.toggle('collapsed');
    } else if (!isAdminAuthenticated) {
        showAdminLogin();
    }
}

// Update responses count
function updateResponsesCount() {
    const responses = getAllResponses();
    const countElement = document.getElementById('responses-count');
    if (countElement) {
        countElement.textContent = responses.length;
    }
}

// Export functions for form responses (only works if authenticated)
function exportResponses(format = 'json') {
    if (!isAdminAuthenticated) {
        showAdminLogin();
        return;
    }
    
    const responses = getAllResponses();
    
    if (responses.length === 0) {
        showNotification('No responses found to export', 'warning');
        return;
    }
    
    let content, filename, mimeType;
    
    if (format === 'csv') {
        content = convertToCSV(responses);
        filename = `debate_registrations_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
    } else {
        content = JSON.stringify(responses, null, 2);
        filename = `debate_registrations_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
    }
    
    downloadFile(content, filename, mimeType);
    showNotification(`Exported ${responses.length} responses as ${format.toUpperCase()}`, 'success');
}

function getAllResponses() {
    const responses = [];
    
    try {
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
            console.error('localStorage is not available');
            return responses;
        }
        
        console.log('Getting all responses, localStorage length:', localStorage.length);
        
        // Loop through all localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue; // Skip if key is null or undefined
            
            if (key.startsWith('registration_')) {
                try {
                    const item = localStorage.getItem(key);
                    if (!item) {
                        console.warn('Empty item for key:', key);
                        continue;
                    }
                    
                    const data = JSON.parse(item);
                    // Add the registration ID to the data
                    data.registrationId = key.replace('registration_', '');
                    responses.push(data);
                } catch (e) {
                    console.error('Failed to parse response:', key, e);
                }
            }
        }
        
        console.log('Total responses retrieved:', responses.length);
    } catch (error) {
        console.error('Error retrieving responses:', error);
    }
    
    // Sort by timestamp (newest first)
    responses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return responses;
}

function convertToCSV(responses) {
    if (responses.length === 0) return '';
    
    const headers = Object.keys(responses[0]);
    const csvHeaders = headers.map(header => `"${header}"`).join(',');
    
    const csvRows = responses.map(response => {
        return headers.map(header => {
            let value = response[header];
            if (Array.isArray(value)) {
                value = value.join('; ');
            }
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function showResponsesCount() {
    try {
        const responses = getAllResponses();
        const countElement = document.getElementById('responses-count');
        
        if (countElement) {
            countElement.textContent = responses.length;
            console.log('Updated responses count display:', responses.length);
        } else {
            console.warn('Responses count element not found');
        }
    } catch (error) {
        console.error('Error updating responses count:', error);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}