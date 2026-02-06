// TontiFaso - Guarantees Page
// Guarantee management and coverage analysis

const GuaranteesPage = {
    render() {
        const guarantees = DataManager.getGuarantees();
        const totalValue = guarantees.reduce((sum, g) => sum + parseFloat(g.value), 0);

        const html = `
            <div class="fade-in">
                <div class="page-header">
                    <h1>Gestion des Garanties</h1>
                    <button class="btn btn-primary" onclick="GuaranteesPage.showAddModal()">
                        <i class="bi bi-plus-circle"></i> Ajouter une Garantie
                    </button>
                </div>

                <!-- Stats Row -->
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-card-icon info">
                                <i class="bi bi-shield-check"></i>
                            </div>
                            <h3>${Calculations.formatCurrency(totalValue)}</h3>
                            <p>Valeur Totale des Garanties</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3>${guarantees.length}</h3>
                            <p>Nombre de Garanties</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3>${this.getLoansWithGuarantees()}</h3>
                            <p>Prêts avec Garantie</p>
                        </div>
                    </div>
                </div>

                <!-- Filter Options -->
                <div class="row mb-3">
                    <div class="col-md-6">
                        <select class="form-select" id="filterType" onchange="GuaranteesPage.render()">
                            <option value="all">Toutes les garanties</option>
                            <option value="withLoan">Prêts avec garantie</option>
                            <option value="withoutLoan">Prêts sans garantie</option>
                        </select>
                    </div>
                </div>

                <!-- Guarantees Table -->
                <div class="table-container">
                    ${this.renderTable()}
                </div>

                <!-- Coverage Analysis -->
                <div class="chart-container mt-4">
                    <h5><i class="bi bi-bar-chart"></i> Analyse de Couverture par Prêt</h5>
                    ${this.renderCoverageAnalysis()}
                </div>
            </div>

            <!-- Add Guarantee Modal -->
            <div class="modal fade" id="guaranteeModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Ajouter une Garantie</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="guaranteeForm">
                                <div class="mb-3">
                                    <label class="form-label">Prêt *</label>
                                    <select class="form-select" id="guaranteeLoanId" required onchange="GuaranteesPage.updateLoanInfo()">
                                        <option value="">Sélectionner un prêt</option>
                                        ${this.renderLoanOptions()}
                                    </select>
                                    <div id="loanInfo" class="mt-2"></div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Type de garantie *</label>
                                    <select class="form-select" id="guaranteeType" required>
                                        <option value="">Sélectionner un type</option>
                                        <option value="Bien immobilier">Bien immobilier</option>
                                        <option value="Véhicule">Véhicule</option>
                                        <option value="Équipement">Équipement</option>
                                        <option value="Terrain">Terrain</option>
                                        <option value="Caution solidaire">Caution solidaire</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Valeur estimée (FCFA) *</label>
                                    <input type="number" class="form-control" id="guaranteeValue" 
                                           min="0" step="1000" required oninput="GuaranteesPage.updateCoverage()">
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="guaranteeDescription" rows="3"></textarea>
                                </div>

                                <div id="coverageInfo" class="alert alert-info" style="display: none;"></div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" class="btn btn-primary" onclick="GuaranteesPage.saveGuarantee()">
                                <i class="bi bi-save"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;
    },

    renderTable() {
        const guarantees = DataManager.getGuarantees();

        if (guarantees.length === 0) {
            return '<div class="alert alert-info">Aucune garantie enregistrée.</div>';
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Prêt / Membre</th>
                            <th>Type</th>
                            <th>Valeur</th>
                            <th>Montant Prêt</th>
                            <th>Couverture</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        guarantees.forEach(guarantee => {
            const loan = DataManager.getLoan(guarantee.loanId);
            const member = loan ? DataManager.getMember(loan.memberId) : null;
            const memberName = member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
            const loanAmount = loan ? loan.principal : 0;
            const coverage = Calculations.getGuaranteeCoverageRatio(guarantee.loanId);

            let coverageClass = 'text-success';
            if (coverage < 50) coverageClass = 'text-danger';
            else if (coverage < 100) coverageClass = 'text-warning';

            html += `
                <tr>
                    <td>
                        <strong>${memberName}</strong><br>
                        <small class="text-muted">Prêt de ${Calculations.formatCurrency(loanAmount)}</small>
                    </td>
                    <td><span class="badge bg-secondary">${guarantee.type}</span></td>
                    <td><strong>${Calculations.formatCurrency(guarantee.value)}</strong></td>
                    <td>${Calculations.formatCurrency(loanAmount)}</td>
                    <td class="${coverageClass}"><strong>${coverage}%</strong></td>
                    <td>${guarantee.description || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-icon" onclick="GuaranteesPage.deleteGuarantee('${guarantee.id}')" title="Supprimer">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    },

    renderLoanOptions() {
        const loans = DataManager.getLoans().filter(l => l.status === 'active');
        return loans.map(l => {
            const member = DataManager.getMember(l.memberId);
            const memberName = member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
            return `<option value="${l.id}">${memberName} - ${Calculations.formatCurrency(l.principal)} (${Calculations.formatDateShort(l.startDate)})</option>`;
        }).join('');
    },

    renderCoverageAnalysis() {
        const loans = DataManager.getLoans();

        if (loans.length === 0) {
            return '<p class="text-muted">Aucun prêt à analyser</p>';
        }

        let html = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Membre</th><th>Montant Prêt</th><th>Valeur Garanties</th><th>Couverture</th></tr></thead><tbody>';

        loans.forEach(loan => {
            const member = DataManager.getMember(loan.memberId);
            const memberName = member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
            const guarantees = DataManager.getLoanGuarantees(loan.id);
            const totalGuaranteeValue = guarantees.reduce((sum, g) => sum + parseFloat(g.value), 0);
            const coverage = Calculations.getGuaranteeCoverageRatio(loan.id);

            let coverageClass = 'bg-success';
            if (coverage < 50) coverageClass = 'bg-danger';
            else if (coverage < 100) coverageClass = 'bg-warning';

            html += `
                <tr>
                    <td>${memberName}</td>
                    <td>${Calculations.formatCurrency(loan.principal)}</td>
                    <td>${Calculations.formatCurrency(totalGuaranteeValue)}</td>
                    <td>
                        <div class="progress" style="height: 25px;">
                            <div class="progress-bar ${coverageClass}" style="width: ${Math.min(coverage, 100)}%">
                                ${coverage}%
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        return html;
    },

    getLoansWithGuarantees() {
        const loans = DataManager.getLoans();
        return loans.filter(loan => {
            const guarantees = DataManager.getLoanGuarantees(loan.id);
            return guarantees.length > 0;
        }).length;
    },

    showAddModal() {
        document.getElementById('guaranteeForm').reset();
        document.getElementById('loanInfo').innerHTML = '';
        document.getElementById('coverageInfo').style.display = 'none';

        const modal = new bootstrap.Modal(document.getElementById('guaranteeModal'));
        modal.show();
    },

    updateLoanInfo() {
        const loanId = document.getElementById('guaranteeLoanId').value;
        if (!loanId) {
            document.getElementById('loanInfo').innerHTML = '';
            return;
        }

        const loan = DataManager.getLoan(loanId);
        if (!loan) return;

        const member = DataManager.getMember(loan.memberId);
        const existingGuarantees = DataManager.getLoanGuarantees(loanId);
        const totalExisting = existingGuarantees.reduce((sum, g) => sum + parseFloat(g.value), 0);

        document.getElementById('loanInfo').innerHTML = `
            <div class="alert alert-secondary">
                <small>
                    <strong>Membre:</strong> ${member ? `${member.firstName} ${member.lastName}` : 'Inconnu'}<br>
                    <strong>Montant du prêt:</strong> ${Calculations.formatCurrency(loan.principal)}<br>
                    <strong>Garanties existantes:</strong> ${Calculations.formatCurrency(totalExisting)}
                </small>
            </div>
        `;
    },

    updateCoverage() {
        const loanId = document.getElementById('guaranteeLoanId').value;
        const value = parseFloat(document.getElementById('guaranteeValue').value) || 0;

        if (!loanId || value <= 0) {
            document.getElementById('coverageInfo').style.display = 'none';
            return;
        }

        const loan = DataManager.getLoan(loanId);
        if (!loan) return;

        const existingGuarantees = DataManager.getLoanGuarantees(loanId);
        const totalExisting = existingGuarantees.reduce((sum, g) => sum + parseFloat(g.value), 0);
        const newTotal = totalExisting + value;
        const newCoverage = (newTotal / loan.principal) * 100;

        let message = '';
        let alertClass = 'alert-success';

        if (newCoverage >= 100) {
            message = `✓ Excellente couverture: ${newCoverage.toFixed(2)}%`;
            alertClass = 'alert-success';
        } else if (newCoverage >= 50) {
            message = `⚠ Couverture partielle: ${newCoverage.toFixed(2)}%`;
            alertClass = 'alert-warning';
        } else {
            message = `✗ Couverture insuffisante: ${newCoverage.toFixed(2)}%`;
            alertClass = 'alert-danger';
        }

        document.getElementById('coverageInfo').className = `alert ${alertClass}`;
        document.getElementById('coverageInfo').innerHTML = `
            <strong>Analyse de couverture:</strong><br>
            ${message}<br>
            <small>Total garanties: ${Calculations.formatCurrency(newTotal)} / Prêt: ${Calculations.formatCurrency(loan.principal)}</small>
        `;
        document.getElementById('coverageInfo').style.display = 'block';
    },

    async saveGuarantee() {
        const form = document.getElementById('guaranteeForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const guaranteeData = {
            loanId: document.getElementById('guaranteeLoanId').value,
            type: document.getElementById('guaranteeType').value,
            value: parseFloat(document.getElementById('guaranteeValue').value),
            description: document.getElementById('guaranteeDescription').value.trim()
        };

        if (guaranteeData.value <= 0) {
            alert('La valeur doit être supérieure à 0');
            return;
        }

        const result = await DataManager.addGuarantee(guaranteeData);
        if (result.success) {
            app.showAlert('Garantie ajoutée avec succès!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('guaranteeModal')).hide();
            this.render();
        } else {
            app.showAlert('Erreur: ' + result.message, 'danger');
        }
    },

    async deleteGuarantee(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette garantie?')) {
            return;
        }

        const result = await DataManager.deleteGuarantee(id);
        if (result.success) {
            app.showAlert('Garantie supprimée avec succès!', 'success');
            this.render();
        } else {
            app.showAlert('Erreur: ' + result.message, 'danger');
        }
    }
};
