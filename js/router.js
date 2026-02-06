const Router = {
    currentPage: null,

    // Page constructors
    pages: {
        dashboard: null,
        members: null,
        deposits: null,
        loans: null,
        guarantees: null,
        reports: null,
        profile: null
    },

    init() {
        // Set up hash change listener
        window.addEventListener('hashchange', () => this.route());

        // Set up navigation click handlers
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.setActiveNav(link);
            });
        });

        // Initial route
        this.route();
    },

    route() {
        const hash = window.location.hash.slice(2) || 'dashboard';
        this.loadPage(hash);
    },

    loadPage(pageName) {
        this.currentPage = pageName;

        // Update page title
        const titles = {
            dashboard: 'Tableau de Bord',
            members: 'Gestion des Membres',
            deposits: 'Gestion des Dépôts',
            loans: 'Gestion des Prêts',
            guarantees: 'Gestion des Garanties',
            reports: 'Rapports Financiers',
            profile: 'Profil Admin'
        };

        document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';

        // Load page content
        const contentDiv = document.getElementById('pageContent');
        contentDiv.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Chargement...</span></div></div>';

        // Small delay for loading effect
        setTimeout(() => {
            switch (pageName) {
                case 'dashboard':
                    if (typeof DashboardPage !== 'undefined') {
                        DashboardPage.render();
                    }
                    break;
                case 'members':
                    if (typeof MembersPage !== 'undefined') {
                        MembersPage.render();
                    }
                    break;
                case 'deposits':
                    if (typeof DepositsPage !== 'undefined') {
                        DepositsPage.render();
                    }
                    break;
                case 'loans':
                    if (typeof LoansPage !== 'undefined') {
                        LoansPage.render();
                    }
                    break;
                case 'guarantees':
                    if (typeof GuaranteesPage !== 'undefined') {
                        GuaranteesPage.render();
                    }
                    break;
                case 'reports':
                    if (typeof ReportsPage !== 'undefined') {
                        ReportsPage.render();
                    }
                    break;
                case 'profile':
                    if (typeof ProfilePage !== 'undefined') {
                        ProfilePage.render();
                    }
                    break;
                default:
                    contentDiv.innerHTML = '<div class="alert alert-warning">Page non trouvée</div>';
            }
        }, 200);
    },

    setActiveNav(activeLink) {
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        if (activeLink) {
            activeLink.classList.add('active');
        } else {
            // Set active based on current page
            const hash = window.location.hash.slice(2) || 'dashboard';
            const link = document.querySelector(`.sidebar-nav .nav-link[data-page="${hash}"]`);
            if (link) {
                link.classList.add('active');
            }
        }
    },

    navigate(pageName) {
        window.location.hash = `#/${pageName}`;
    }
};
