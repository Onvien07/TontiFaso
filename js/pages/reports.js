// Financial reports and analytics


const ReportsPage = {
    charts: {},

    render() {
        const stats = Calculations.getGlobalStats();
        const memberStats = Calculations.getMemberStats();

        const html = `
            <div class="fade-in">
                <h1 class="mb-4">Rapports Financiers</h1>

                <!-- Global Summary -->
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-card-icon primary">
                                <i class="bi bi-people"></i>
                            </div>
                            <h3>${stats.totalMembers}</h3>
                            <p>Total Membres</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-card-icon success">
                                <i class="bi bi-cash-stack"></i>
                            </div>
                            <h3>${Calculations.formatCurrency(stats.totalDeposits)}</h3>
                            <p>Total Dépôts</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-card-icon secondary">
                                <i class="bi bi-wallet2"></i>
                            </div>
                            <h3>${Calculations.formatCurrency(stats.totalLoans)}</h3>
                            <p>Total Prêts</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-card-icon info">
                                <i class="bi bi-shield-check"></i>
                            </div>
                            <h3>${Calculations.formatCurrency(stats.totalGuarantees)}</h3>
                            <p>Total Garanties</p>
                        </div>
                    </div>
                </div>

                <!-- Member Statistics Table -->
                <div class="table-container mb-4">
                    <h5 class="mb-3"><i class="bi bi-table"></i> Statistiques par Membre</h5>
                    ${this.renderMemberStatsTable(memberStats)}
                </div>

                <!-- Charts -->
                <div class="row g-4">
                    <div class="col-lg-6">
                        <div class="chart-container">
                            <h5><i class="bi bi-pie-chart"></i> Répartition des Dépôts par Membre</h5>
                            <canvas id="depositsChartReport"></canvas>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="chart-container">
                            <h5><i class="bi bi-bar-chart"></i> Prêts par Membre</h5>
                            <canvas id="loansChartReport"></canvas>
                        </div>
                    </div>
                </div>

                <div class="row g-4 mt-2">
                    <div class="col-lg-12">
                        <div class="chart-container">
                            <h5><i class="bi bi-graph-up"></i> Vue d'Ensemble Financière par Membre</h5>
                            <canvas id="overviewChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = html;

        // Render charts
        setTimeout(() => {
            this.renderDepositsChart(memberStats);
            this.renderLoansChart(memberStats);
            this.renderOverviewChart(memberStats);
        }, 100);
    },

    renderMemberStatsTable(memberStats) {
        if (memberStats.length === 0) {
            return '<div class="alert alert-info">Aucune donnée disponible</div>';
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Membre</th>
                            <th>Dépôts</th>
                            <th>Prêts</th>
                            <th>Garanties</th>
                            <th>Solde (Dépôts - Prêts)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        memberStats.forEach(stat => {
            const balanceClass = stat.balance >= 0 ? 'text-success' : 'text-danger';

            html += `
                <tr>
                    <td><strong>${stat.name}</strong></td>
                    <td class="text-success">${Calculations.formatCurrency(stat.deposits)}</td>
                    <td class="text-warning">${Calculations.formatCurrency(stat.loans)}</td>
                    <td class="text-info">${Calculations.formatCurrency(stat.guarantees)}</td>
                    <td class="${balanceClass}"><strong>${Calculations.formatCurrency(stat.balance)}</strong></td>
                </tr>
            `;
        });

        // Totals row
        const totalDeposits = memberStats.reduce((sum, s) => sum + s.deposits, 0);
        const totalLoans = memberStats.reduce((sum, s) => sum + s.loans, 0);
        const totalGuarantees = memberStats.reduce((sum, s) => sum + s.guarantees, 0);
        const totalBalance = totalDeposits - totalLoans;

        html += `
                        <tr class="table-active">
                            <td><strong>TOTAUX</strong></td>
                            <td class="text-success"><strong>${Calculations.formatCurrency(totalDeposits)}</strong></td>
                            <td class="text-warning"><strong>${Calculations.formatCurrency(totalLoans)}</strong></td>
                            <td class="text-info"><strong>${Calculations.formatCurrency(totalGuarantees)}</strong></td>
                            <td class="${totalBalance >= 0 ? 'text-success' : 'text-danger'}"><strong>${Calculations.formatCurrency(totalBalance)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        return html;
    },

    renderDepositsChart(memberStats) {
        const stats = memberStats.filter(s => s.deposits > 0);

        const ctx = document.getElementById('depositsChartReport');
        if (this.charts.deposits) {
            this.charts.deposits.destroy();
        }

        this.charts.deposits = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: stats.map(s => s.name),
                datasets: [{
                    data: stats.map(s => s.deposits),
                    backgroundColor: [
                        '#0B1C2D',
                        '#C9A24D',
                        '#28a745',
                        '#17a2b8',
                        '#ffc107',
                        '#dc3545',
                        '#6610f2',
                        '#fd7e14'
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.parsed;
                                return context.label + ': ' + value.toLocaleString() + ' FCFA';
                            }
                        }
                    }
                }
            }
        });
    },

    renderLoansChart(memberStats) {
        const stats = memberStats.filter(s => s.loans > 0);

        const ctx = document.getElementById('loansChartReport');
        if (this.charts.loans) {
            this.charts.loans.destroy();
        }

        this.charts.loans = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: stats.map(s => s.name),
                datasets: [{
                    label: 'Montant des Prêts (FCFA)',
                    data: stats.map(s => s.loans),
                    backgroundColor: '#C9A24D',
                    borderColor: '#0B1C2D',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true
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

    renderOverviewChart(memberStats) {
        const ctx = document.getElementById('overviewChart');
        if (this.charts.overview) {
            this.charts.overview.destroy();
        }

        this.charts.overview = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: memberStats.map(s => s.name),
                datasets: [
                    {
                        label: 'Dépôts',
                        data: memberStats.map(s => s.deposits),
                        backgroundColor: '#28a745',
                        borderColor: '#198754',
                        borderWidth: 1
                    },
                    {
                        label: 'Prêts',
                        data: memberStats.map(s => s.loans),
                        backgroundColor: '#C9A24D',
                        borderColor: '#b89140',
                        borderWidth: 1
                    },
                    {
                        label: 'Garanties',
                        data: memberStats.map(s => s.guarantees),
                        backgroundColor: '#17a2b8',
                        borderColor: '#138496',
                        borderWidth: 1
                    }
                ]
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
