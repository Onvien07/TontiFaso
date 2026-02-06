// TontiFaso - Main Application


const app = {
    async init() {
        console.log('🚀 TontiFaso Microfinance Application Starting...');

        // Initialize data manager
        await DataManager.init();
        console.log('✅ Data Manager initialized and synced');

        // Initialize router
        Router.init();
        console.log('✅ Router initialized');

        // Set up menu toggle for mobile
        this.setupMobileMenu();
        console.log('✅ Mobile menu configured');

        console.log('✅ TontiFaso Application Ready!');
    },

    setupMobileMenu() {
        const btnMenu = document.getElementById('btnMenu');
        const sidebar = document.getElementById('sidebar');

        if (btnMenu && sidebar) {
            btnMenu.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    if (!sidebar.contains(e.target) && !btnMenu.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                }
            });

            // Close sidebar when a link is clicked on mobile
            document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 992) {
                        sidebar.classList.remove('active');
                    }
                });
            });
        }
    },

    async logout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            try {
                const response = await fetch('backend/auth/logout.php');
                const result = await response.json();
                if (result.success) {
                    alert('Déconnexion réussie !');
                    window.location.reload();
                }
            } catch (error) {
                console.error('Logout failed', error);
                window.location.reload();
            }
        }
    },

    // Utility function to show alerts
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    },

    // Utility function to confirm actions
    confirm(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
