// TontiFaso - Loans Page
// Complete loan management with payments tracking

const LoansPage = {
    render() {
        const loans = DataManager.getLoans();
        const stats = Calculations.getGlobalStats();

        const html = `
            <div class="fade-in">
                <div class="page-header">
                    <h1>Gestion des Prêts</h1>
                    <button class="btn btn-primary" onclick="LoansPage.showAddModal()">
                        <i class="bi bi-plus-circle"></i> Nouveau Prêt
                    </button>
                </div>

                <!-- Stats Row -->
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h3 class="text-primary">${loans.length}</h3>
                            <p>Total Prêts</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h3 class="text-success">${stats.activeLoans}</h3>
                            <p>Prêts Actifs</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h3 class="text-info">${stats.paidLoans}</h3>
                            <p>Prêts Remboursés</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h3 class="text-warning">${Calculations.formatCurrency(stats.totalInterest)}</h3>
                            <p>Intérêts Totaux</p>
                        </div>
                    </div>
                </div>

                <!-- Loans Table -->
                <div class="table-container">
                    ${this.renderTable()}
                </div>
            </div>

            <!-- Add Loan Modal -->
            <div class="modal fade" id="loanModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Nouveau Prêt</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="loanForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Membre *</label>
                                        <select class="form-select" id="loanMemberId" required>
                                            <option value="">Sélectionner un membre</option>
                                            ${this.renderMemberOptions()}
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Date de début *</label>
                                        <input type="date" class="form-control" id="loanStartDate" required>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Montant du prêt (FCFA) *</label>
                                        <input type="number" class="form-control" id="loanPrincipal" 
                                               min="0" step="1000" required oninput="LoansPage.calculatePreview()">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Durée (mois) *</label>
                                        <input type="number" class="form-control" id="loanDuration" 
                                               min="1" max="120" required oninput="LoansPage.calculatePreview()">
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Taux d'intérêt mensuel (%) *</label>
                                        <input type="number" class="form-control" id="loanInterestRate" 
                                               min="0" max="100" step="0.1" required oninput="LoansPage.calculatePreview()">
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="loanDescription" rows="2"></textarea>
                                </div>

                                <!-- Calculation Preview -->
                                <div id="loanPreview" class="alert alert-info" style="display: none;">
                                    <h6><strong>Aperçu du calcul :</strong></h6>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p class="mb-1"><strong>Capital:</strong> <span id="previewPrincipal">-</span></p>
                                            <p class="mb-1"><strong>Intérêt total:</strong> <span id="previewInterest">-</span></p>
                                            <p class="mb-1"><strong>Montant total:</strong> <span id="previewTotal">-</span></p>
                                        </div>
                                        <div class="col-md-6">
                                            <p class="mb-1"><strong>Paiement mensuel:</strong> <span id="previewMonthly">-</span></p>
                                            <p class="mb-1"><strong>Durée:</strong> <span id="previewDuration">-</span></p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" class="btn btn-primary" onclick="LoansPage.saveLoan()">
                                <i class="bi bi-save"></i> Créer le Prêt
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payment Modal -->
            <div class="modal fade" id="paymentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">Ajouter un Remboursement</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="paymentForm">
                                <input type="hidden" id="paymentLoanId">
                                
                                <div class="mb-3">
                                    <label class="form-label">Montant (FCFA) *</label>
                                    <input type="number" class="form-control" id="paymentAmount" 
                                           min="0" step="0.01" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Date *</label>
                                    <input type="date" class="form-control" id="paymentDate" required>
                                </div>

                                <div id="paymentInfo" class="alert alert-info"></div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" class="btn btn-success" onclick="LoansPage.savePayment()">
                                <i class="bi bi-check-circle"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;
    },

    renderTable() {
        const loans = DataManager.getLoans().sort((a, b) =>
            new Date(b.startDate) - new Date(a.startDate)
        );

        if (loans.length === 0) {
            return '<div class="alert alert-info">Aucun prêt enregistré.</div>';
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Membre</th>
                            <th>Capital</th>
                            <th>Taux</th>
                            <th>Durée</th>
                            <th>Intérêt</th>
                            <th>Total</th>
                            <th>Payé</th>
                            <th>Reste</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        loans.forEach(loan => {
            const member = DataManager.getMember(loan.memberId);
            const memberName = member ? `${member.firstName} ${member.lastName}` : 'Membre supprimé';
            const progress = Calculations.getLoanProgress(loan);

            let statusBadge = '';
            if (loan.status === 'active') {
                statusBadge = '<span class="badge badge-active">Actif</span>';
            } else if (loan.status === 'paid') {
                statusBadge = '<span class="badge badge-paid">Remboursé</span>';
            } else if (loan.status === 'defaulted') {
                statusBadge = '<span class="badge badge-defaulted">En défaut</span>';
            }

            html += `
                <tr>
                    <td><strong>${memberName}</strong><br><small class="text-muted">${Calculations.formatDateShort(loan.startDate)}</small></td>
                    <td>${Calculations.formatCurrency(loan.principal)}</td>
                    <td>${loan.interestRate}%</td>
                    <td>${loan.duration} mois</td>
                    <td class="text-warning">${Calculations.formatCurrency(loan.totalInterest)}</td>
                    <td><strong>${Calculations.formatCurrency(loan.totalAmount)}</strong></td>
                    <td class="text-success">${Calculations.formatCurrency(loan.paidAmount || 0)}</td>
                    <td class="text-danger"><strong>${Calculations.formatCurrency(loan.remainingBalance)}</strong></td>
                    <td>${statusBadge}<br>
                        <div class="progress mt-1" style="height: 5px;">
                            <div class="progress-bar bg-success" style="width: ${progress}%"></div>
                        </div>
                    </td>
                    <td>
                        ${loan.status === 'active' ? `
                            <button class="btn btn-sm btn-success btn-icon" onclick="LoansPage.showPaymentModal('${loan.id}')" title="Ajouter remboursement">
                                <i class="bi bi-cash"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-info btn-icon" onclick="LoansPage.viewDetails('${loan.id}')" title="Détails">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-icon" onclick="LoansPage.deleteLoan('${loan.id}')" title="Supprimer">
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

    renderMemberOptions() {
        const members = DataManager.getMembers();
        return members.map(m =>
            `<option value="${m.id}">${m.firstName} ${m.lastName}</option>`
        ).join('');
    },

    showAddModal() {
        document.getElementById('loanForm').reset();
        document.getElementById('loanStartDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('loanPreview').style.display = 'none';

        const modal = new bootstrap.Modal(document.getElementById('loanModal'));
        modal.show();
    },

    calculatePreview() {
        const principal = parseFloat(document.getElementById('loanPrincipal').value) || 0;
        const rate = parseFloat(document.getElementById('loanInterestRate').value) || 0;
        const duration = parseInt(document.getElementById('loanDuration').value) || 0;

        if (principal > 0 && rate > 0 && duration > 0) {
            const calc = Calculations.calculateLoan(principal, rate, duration);

            document.getElementById('previewPrincipal').textContent = Calculations.formatCurrency(calc.principal);
            document.getElementById('previewInterest').textContent = Calculations.formatCurrency(calc.totalInterest);
            document.getElementById('previewTotal').textContent = Calculations.formatCurrency(calc.totalAmount);
            document.getElementById('previewMonthly').textContent = Calculations.formatCurrency(calc.monthlyPayment);
            document.getElementById('previewDuration').textContent = `${duration} mois`;

            document.getElementById('loanPreview').style.display = 'block';
        } else {
            document.getElementById('loanPreview').style.display = 'none';
        }
    },

    async saveLoan() {
        const form = document.getElementById('loanForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const loanData = {
            memberId: document.getElementById('loanMemberId').value,
            principal: parseFloat(document.getElementById('loanPrincipal').value),
            interestRate: parseFloat(document.getElementById('loanInterestRate').value),
            duration: parseInt(document.getElementById('loanDuration').value),
            startDate: document.getElementById('loanStartDate').value,
            description: document.getElementById('loanDescription').value.trim()
        };

        if (loanData.principal <= 0) {
            alert('Le montant doit être supérieur à 0');
            return;
        }

        if (loanData.duration <= 0) {
            alert('La durée doit être supérieure à 0');
            return;
        }

        const result = await DataManager.addLoan(loanData);
        if (result.success) {
            app.showAlert('Prêt créé avec succès!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('loanModal')).hide();
            this.render();
        } else {
            app.showAlert('Erreur: ' + result.message, 'danger');
        }
    },

    showPaymentModal(loanId) {
        const loan = DataManager.getLoan(loanId);
        if (!loan) return;

        document.getElementById('paymentForm').reset();
        document.getElementById('paymentLoanId').value = loanId;
        document.getElementById('paymentAmount').value = loan.monthlyPayment;
        document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];

        const payments = DataManager.getLoanPayments(loanId);
        document.getElementById('paymentInfo').innerHTML = `
            <strong>Prêt:</strong> ${Calculations.formatCurrency(loan.totalAmount)}<br>
            <strong>Reste à payer:</strong> ${Calculations.formatCurrency(loan.remainingBalance)}<br>
            <strong>Paiement mensuel suggéré:</strong> ${Calculations.formatCurrency(loan.monthlyPayment)}<br>
            <strong>Nombre de paiements:</strong> ${payments.length}
        `;

        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    },

    async savePayment() {
        const form = document.getElementById('paymentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const paymentData = {
            loanId: document.getElementById('paymentLoanId').value,
            amount: parseFloat(document.getElementById('paymentAmount').value),
            date: document.getElementById('paymentDate').value
        };

        if (paymentData.amount <= 0) {
            alert('Le montant doit être supérieur à 0');
            return;
        }

        const result = await DataManager.addPayment(paymentData);
        if (result.success) {
            app.showAlert('Remboursement enregistré avec succès!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
            this.render();
        } else {
            app.showAlert('Erreur: ' + result.message, 'danger');
        }
    },

    viewDetails(loanId) {
        const loan = DataManager.getLoan(loanId);
        if (!loan) return;

        const member = DataManager.getMember(loan.memberId);
        const payments = DataManager.getLoanPayments(loanId);

        let paymentsHtml = '<p class="text-muted">Aucun remboursement</p>';
        if (payments.length > 0) {
            paymentsHtml = '<ul class="list-group">';
            payments.forEach(p => {
                paymentsHtml += `
                    <li class="list-group-item d-flex justify-content-between">
                        <span>${Calculations.formatDateShort(p.date)}</span>
                        <strong>${Calculations.formatCurrency(p.amount)}</strong>
                    </li>
                `;
            });
            paymentsHtml += '</ul>';
        }

        const detailHtml = `
            <div class="alert alert-primary">
                <h5>Détails du Prêt</h5>
                <hr>
                <p><strong>Membre:</strong> ${member ? `${member.firstName} ${member.lastName}` : 'Inconnu'}</p>
                <p><strong>Date début:</strong> ${Calculations.formatDate(loan.startDate)}</p>
                <p><strong>Description:</strong> ${loan.description || '-'}</p>
                <hr>
                <p><strong>Capital:</strong> ${Calculations.formatCurrency(loan.principal)}</p>
                <p><strong>Taux:</strong> ${loan.interestRate}% par mois</p>
                <p><strong>Durée:</strong> ${loan.duration} mois</p>
                <p><strong>Intérêt total:</strong> ${Calculations.formatCurrency(loan.totalInterest)}</p>
                <p><strong>Montant total:</strong> ${Calculations.formatCurrency(loan.totalAmount)}</p>
                <p><strong>Paiement mensuel:</strong> ${Calculations.formatCurrency(loan.monthlyPayment)}</p>
                <hr>
                <h6>Historique des Remboursements</h6>
                ${paymentsHtml}
            </div>
        `;

        // Show in alert for now (could be a modal)
        const div = document.createElement('div');
        div.innerHTML = detailHtml;
        document.getElementById('pageContent').insertBefore(div, document.getElementById('pageContent').firstChild);
        div.scrollIntoView({ behavior: 'smooth' });
    },

    async deleteLoan(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce prêt? Tous les remboursements et garanties associés seront également supprimés.')) {
            return;
        }

        const result = await DataManager.deleteLoan(id);
        if (result.success) {
            app.showAlert('Prêt supprimé avec succès!', 'success');
            this.render();
        } else {
            app.showAlert('Erreur: ' + result.message, 'danger');
        }
    }
};
