const ProfilePage = {
    render() {
        const stats = Calculations.getGlobalStats();

        const html = `
            <div class="fade-in">
                <h1 class="mb-4">Profil Administrateur</h1>

                <!-- Admin Profile Card -->
                <div class="row">
                    <div class="col-lg-4 mb-4">
                        <div class="stat-card text-center">
                            <div class="mb-3">
                                <i class="bi bi-person-circle" style="font-size: 100px; color: var(--color-primary);"></i>
                            </div>
                            <h3>Administrateur</h3>
                            <p class="text-muted">TontiFaso Admin</p>
                            <hr>
                            <p class="mb-1"><strong>Email:</strong> admin@tontifaso.com</p>
                            <p class="mb-1"><strong>Rôle:</strong> Super Admin</p>
                            <p class="mb-1"><strong>Dernière connexion:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    <div class="col-lg-8">
                        <!-- System Statistics -->
                        <div class="stat-card mb-4">
                            <h5 class="mb-3"><i class="bi bi-graph-up"></i> Statistiques du Système</h5>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="d-flex align-items-center">
                                        <div class="stat-card-icon primary me-3" style="width: 50px; height: 50px;">
                                            <i class="bi bi-people"></i>
                                        </div>
                                        <div>
                                            <h4 class="mb-0">${stats.totalMembers}</h4>
                                            <p class="text-muted mb-0">Membres Actifs</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="d-flex align-items-center">
                                        <div class="stat-card-icon success me-3" style="width: 50px; height: 50px;">
                                            <i class="bi bi-cash-stack"></i>
                                        </div>
                                        <div>
                                            <h4 class="mb-0">${Calculations.formatCurrency(stats.totalDeposits)}</h4>
                                            <p class="text-muted mb-0">Total Dépôts</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="d-flex align-items-center">
                                        <div class="stat-card-icon secondary me-3" style="width: 50px; height: 50px;">
                                            <i class="bi bi-wallet2"></i>
                                        </div>
                                        <div>
                                            <h4 class="mb-0">${stats.activeLoans}</h4>
                                            <p class="text-muted mb-0">Prêts Actifs</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="d-flex align-items-center">
                                        <div class="stat-card-icon info me-3" style="width: 50px; height: 50px;">
                                            <i class="bi bi-shield-check"></i>
                                        </div>
                                        <div>
                                            <h4 class="mb-0">${Calculations.formatCurrency(stats.totalGuarantees)}</h4>
                                            <p class="text-muted mb-0">Total Garanties</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Settings Panel -->
                        <div class="stat-card">
                            <h5 class="mb-3"><i class="bi bi-gear"></i> Paramètres</h5>
                            
                            <div class="mb-3">
                                <label class="form-label">Nom de l'organisation</label>
                                <input type="text" class="form-control" value="TontiFaso" readonly>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Devise</label>
                                <select class="form-select" disabled>
                                    <option selected>FCFA (XOF)</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Langue</label>
                                <select class="form-select" disabled>
                                    <option selected>Français</option>
                                    <option>English</option>
                                </select>
                            </div>

                            <hr>
                            
                            <h6 class="mb-3">Actions du Système</h6>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary" onclick="ProfilePage.exportData()">
                                    <i class="bi bi-download"></i> Exporter les Données
                                </button>
                                <button class="btn btn-outline-warning" onclick="ProfilePage.clearData()">
                                    <i class="bi bi-trash"></i> Réinitialiser les Données
                                </button>
                                <button class="btn btn-outline-danger" onclick="app.logout()">
                                    <i class="bi bi-box-arrow-right"></i> Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Application Info -->
                <div class="stat-card mt-4">
                    <h5 class="mb-3"><i class="bi bi-info-circle"></i> Informations sur l'Application</h5>
                        <div class="col-md-6">
                            <p><strong>Technologie:</strong> HTML, CSS, JavaScript</p>
                        </div>
                    </div>
                    <hr>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;
    },

    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            members: DataManager.getMembers(),
            deposits: DataManager.getDeposits(),
            loans: DataManager.getLoans(),
            guarantees: DataManager.getGuarantees(),
            payments: DataManager.getPayments()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `tontifaso-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        app.showAlert('Données exportées avec succès!', 'success');
    },

    clearData() {
        if (!confirm('⚠ ATTENTION: Cette action supprimera toutes les données de l\'application (membres, dépôts, prêts, garanties). Cette action est irréversible. Voulez-vous continuer?')) {
            return;
        }

        if (!confirm('Êtes-vous VRAIMENT sûr? Toutes les données seront perdues définitivement.')) {
            return;
        }

        DataManager.clearAll();
        app.showAlert('Toutes les données ont été supprimées.', 'warning');

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
};
