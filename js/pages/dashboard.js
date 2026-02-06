// TontiFaso - Dashboard Page
// Main statistics and charts

const DashboardPage = {
    charts: {},

    render() {
        const stats = Calculations.getGlobalStats();

        const html = `
            <div class="fade-in">
                <!-- Statistics Cards -->
                <div class="row g-4 mb-4">
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card">
                            <div class="stat-card-icon primary">
                                <i class="bi bi-people"></i>
                            </div>
                            <h3>${stats.totalMembers}</h3>
                            <p>Membres Actifs</p>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card">
                            <div class="stat-card-icon success">
                                <i class="bi bi-cash-stack"></i>
                            </div>
                            <h3>${Calculations.formatCurrency(stats.totalDeposits)}</h3>
                            <p>Total Dépôts</p>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card">
                            <div class="stat-card-icon secondary">
                                <i class="bi bi-wallet2"></i>
                            </div>
                            <h3>${Calculations.formatCurrency(stats.totalLoans)}</h3>
                            <p>Total Prêts</p>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card">
                            <div class="stat-card-icon info">
                                <i class="bi bi-shield-check"></i>
                            </div>
                            <h3>${Calculations.formatCurrency(stats.totalGuarantees)}</h3>
                            <p>Total Garanties</p>
                        </div>
                    </div>
                </div>

                <!-- Additional Stats Row -->
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3 class="text-success">${stats.activeLoans}</h3>
                            <p>Prêts Actifs</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3 class="text-info">${stats.paidLoans}</h3>
                            <p>Prêts Remboursés</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3 class="text-warning">${Calculations.formatCurrency(stats.totalInterest)}</h3>
                            <p>Intérêts Totaux</p>
                        </div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="row g-4">
                    <div class="col-lg-6">
                        <div class="chart-container">
                            <h5><i class="bi bi-bar-chart"></i> Évolution des Dépôts</h5>
                            <canvas id="depositsChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="col-lg-6">
                        <div class="chart-container">
                            <h5><i class="bi bi-pie-chart"></i> Distribution des Prêts</h5>
                            <canvas id="loansChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="row g-4 mt-2">
                    <div class="col-lg-12">
                        <div class="chart-container">
                            <h5><i class="bi bi-graph-up"></i> Garanties par Prêt</h5>
                            <canvas id="guaranteesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;

        // Render charts
        setTimeout(() => {
            this.renderDepositsChart();
            this.renderLoansChart();
            this.renderGuaranteesChart();
        }, 100);
    },

    renderDepositsChart() {
        const deposits = DataManager.getDeposits();

        // Group deposits by month
        const depositsByMonth = {};
        deposits.forEach(deposit => {
            const date = new Date(deposit.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!depositsByMonth[monthKey]) {
                depositsByMonth[monthKey] = 0;
            }
            depositsByMonth[monthKey] += parseFloat(deposit.amount);
        });

        const labels = Object.keys(depositsByMonth).sort();
        const data = labels.map(key => depositsByMonth[key]);

        const ctx = document.getElementById('depositsChart');
        if (this.charts.deposits) {
            this.charts.deposits.destroy();
        }

        this.charts.deposits = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.map(label => {
                    const [year, month] = label.split('-');
                    return `${month}/${year}`;
                }),
                datasets: [{
                    label: 'Dépôts (FCFA)',
                    data: data,
                    borderColor: '#C9A24D',
                    backgroundColor: 'rgba(201, 162, 77, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return value.toLocaleString() + ' FCFA';
                            }
                        }
                    }
                }
            }
        });
    },

    renderLoansChart() {
        const loans = DataManager.getLoans();

        const statusCounts = {
            active: loans.filter(l => l.status === 'active').length,
            paid: loans.filter(l => l.status === 'paid').length,
            defaulted: loans.filter(l => l.status === 'defaulted').length
        };

        const ctx = document.getElementById('loansChart');
        if (this.charts.loans) {
            this.charts.loans.destroy();
        }

        this.charts.loans = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Actifs', 'Remboursés', 'En défaut'],
                datasets: [{
                    data: [statusCounts.active, statusCounts.paid, statusCounts.defaulted],
                    backgroundColor: [
                        '#28a745',
                        '#17a2b8',
                        '#dc3545'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    },

    renderGuaranteesChart() {
        const loans = DataManager.getLoans();
        const members = DataManager.getMembers();

        const memberNames = [];
        const guaranteeValues = [];

        members.forEach(member => {
            const memberGuarantees = Calculations.getMemberTotalGuarantees(member.id);
            if (memberGuarantees > 0) {
                memberNames.push(`${member.firstName} ${member.lastName}`);
                guaranteeValues.push(memberGuarantees);
            }
        });

        const ctx = document.getElementById('guaranteesChart');
        if (this.charts.guarantees) {
            this.charts.guarantees.destroy();
        }

        this.charts.guarantees = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: memberNames.length > 0 ? memberNames : ['Aucune garantie'],
                datasets: [{
                    label: 'Valeur des Garanties (FCFA)',
                    data: guaranteeValues.length > 0 ? guaranteeValues : [0],
                    backgroundColor: '#0B1C2D',
                    borderColor: '#C9A24D',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return value.toLocaleString() + ' FCFA';
                            }
                        }
                    }
                }
            }
        });
    }
};
