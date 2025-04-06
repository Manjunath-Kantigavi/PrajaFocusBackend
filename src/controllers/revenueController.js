const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Add this function for development/testing
const initializeSampleTransactions = async () => {
    try {
        const count = await Transaction.countDocuments();
        if (count === 0) {
            const sampleTransactions = [
                {
                    transactionId: 'TXN001',
                    userId: '65f2d1234567890123456789', // Replace with an actual user ID
                    userName: 'Test User 1',
                    amount: 499,
                    status: 'success',
                    paymentMethod: 'razorpay',
                    subscriptionDuration: 30,
                    createdAt: new Date('2024-03-01')
                },
                {
                    transactionId: 'TXN002',
                    userId: '65f2d1234567890123456789',
                    userName: 'Test User 2',
                    amount: 899,
                    status: 'success',
                    paymentMethod: 'razorpay',
                    subscriptionDuration: 90,
                    createdAt: new Date('2024-03-10')
                },
                {
                    transactionId: 'TXN003',
                    userId: '65f2d1234567890123456789',
                    userName: 'Test User 3',
                    amount: 1499,
                    status: 'success',
                    paymentMethod: 'razorpay',
                    subscriptionDuration: 180,
                    createdAt: new Date('2024-03-15')
                }
            ];

            await Transaction.insertMany(sampleTransactions);
            console.log('✅ Sample transactions initialized');
        }
    } catch (error) {
        console.error('Error initializing sample transactions:', error);
    }
};

// Call this at the start of getRevenueStats
exports.getRevenueStats = async (req, res) => {
    try {
        // Initialize sample data if needed
        await initializeSampleTransactions();
        
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