const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getRevenueStats = async (req, res) => {
    try {
        const timeFrame = req.query.timeFrame || 'all';
        let dateFilter = {};

        // Set date filter based on timeFrame
        const now = new Date();
        switch (timeFrame) {
            case 'today':
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.setHours(0, 0, 0, 0)),
                        $lt: new Date(now.setHours(23, 59, 59, 999))
                    }
                };
                break;
            case 'week':
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.setDate(now.getDate() - 7))
                    }
                };
                break;
            case 'month':
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.setMonth(now.getMonth() - 1))
                    }
                };
                break;
            case 'year':
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.setFullYear(now.getFullYear() - 1))
                    }
                };
                break;
        }

        // Get successful transactions
        const transactions = await Transaction.find({
            ...dateFilter,
            status: 'success'
        }).sort({ createdAt: -1 });

        // Calculate stats
        const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalTransactions = transactions.length;
        const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        // Get active subscribers count
        const activeSubscribers = await User.countDocuments({
            jobAlertSubscription: true,
            $or: [
                { subscriptionExpiresAt: { $gt: new Date() } },
                { subscriptionExpiresAt: null }
            ]
        });

        // Prepare chart data
        const chartData = {
            labels: [],
            values: []
        };

        // Group transactions by date for the chart
        const groupedTransactions = transactions.reduce((groups, tx) => {
            const date = tx.createdAt.toLocaleDateString();
            if (!groups[date]) {
                groups[date] = 0;
            }
            groups[date] += tx.amount;
            return groups;
        }, {});

        // Convert grouped data to arrays for the chart
        Object.entries(groupedTransactions).forEach(([date, amount]) => {
            chartData.labels.push(date);
            chartData.values.push(amount);
        });

        res.json({
            totalRevenue,
            totalTransactions,
            averageTransaction,
            activeSubscribers,
            chartData,
            transactions: transactions.map(tx => ({
                transactionId: tx.transactionId,
                userName: tx.userName,
                amount: tx.amount,
                date: tx.createdAt,
                status: tx.status
            }))
        });
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        res.status(500).json({ message: 'Error fetching revenue data', error: error.message });
    }
};