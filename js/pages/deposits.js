// TontiFaso - Deposits Page
// Deposit tracking and management


const DepositsPage = {
    render() {
        const deposits = DataManager.getDeposits();
        const totalDeposits = deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);

        const html = `
            <div class="fade-in">
                <div class="page-header">
                    <h1>Gestion des Dépôts</h1>
                    <button class="btn btn-primary" onclick="DepositsPage.showAddModal()">
                        <i class="bi bi-plus-circle"></i> Ajouter un Dépôt
                    </button>
                </div>

                <!-- Total Summary -->
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-card-icon success">
                                <i class="bi bi-cash-stack"></i>
                            </div>
                            <h3>${Calculations.formatCurrency(totalDeposits)}</h3>
                            <p>Total des Dépôts</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3>${deposits.length}</h3>
                            <p>Nombre de Dépôts</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3>${Calculations.formatCurrency(deposits.length > 0 ? totalDeposits / deposits.length : 0)}</h3>
                            <p>Dépôt Moyen</p>
                        </div>
                    </div>
                </div>

                <!-- Deposits Table -->
                <div class="table-container">
                    ${this.renderTable()}
                </div>
            </div>

            <!-- Add Deposit Modal -->
            <div class="modal fade" id="depositModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Ajouter un Dépôt</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="depositForm">
                                <div class="mb-3">
                                    <label class="form-label">Membre *</label>
                                    <select class="form-select" id="depositMemberId" required>
                                        <option value="">Sélectionner un membre</option>
                                        ${this.renderMemberOptions()}
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Montant (FCFA) *</label>
                                    <input type="number" class="form-control" id="depositAmount" 
                                           min="0" step="0.01" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Date *</label>
                                    <input type="date" class="form-control" id="depositDate" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="depositDescription" rows="2"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" class="btn btn-primary" onclick="DepositsPage.saveDeposit()">
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
        const deposits = DataManager.getDeposits().sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        if (deposits.length === 0) {
            return '<div class="alert alert-info">Aucun dépôt enregistré.</div>';
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Membre</th>
                            <th>Montant</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        deposits.forEach(deposit => {
            const member = DataManager.getMember(deposit.memberId);
            const memberName = member ? `${member.firstName} ${member.lastName}` : 'Membre supprimé';

            html += `
                <tr>
                    <td>${Calculations.formatDateShort(deposit.date)}</td>
                    <td><strong>${memberName}</strong></td>
                    <td class="text-success"><strong>${Calculations.formatCurrency(deposit.amount)}</strong></td>
                    <td>${deposit.description || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-icon" onclick="DepositsPage.deleteDeposit('${deposit.id}')" title="Supprimer">
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
        document.getElementById('depositForm').reset();
        document.getElementById('depositDate').value = new Date().toISOString().split('T')[0];

        const modal = new bootstrap.Modal(document.getElementById('depositModal'));
        modal.show();
    },

    async saveDeposit() {
        const form = document.getElementById('depositForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const depositData = {
            memberId: document.getElementById('depositMemberId').value,
            amount: parseFloat(document.getElementById('depositAmount').value),
            date: document.getElementById('depositDate').value,
            description: document.getElementById('depositDescription').value.trim()
        };

        if (depositData.amount <= 0) {
            alert('Le montant doit être supérieur à 0');
            return;
        }

        const result = await DataManager.addDeposit(depositData);
        if (result.success) {
            app.showAlert('Dépôt ajouté avec succès!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('depositModal')).hide();
            this.render();
        } else {
            app.showAlert('Erreur: ' + result.message, 'danger');
        }
    },

    async deleteDeposit(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce dépôt?')) {
            return;
        }

        const result = await DataManager.deleteDeposit(id);
        if (result.success) {
            app.showAlert('Dépôt supprimé avec succès!', 'success');
            this.render();
        } else {
            app.showAlert('Erreur: ' + result.message, 'danger');
        }
    }
};
