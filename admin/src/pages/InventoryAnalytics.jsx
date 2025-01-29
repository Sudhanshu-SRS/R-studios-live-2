import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { HiChartBar, HiCalendar, HiSortAscending, HiSortDescending, HiFilter } from 'react-icons/hi';

const InventoryAnalytics = ({ token }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('totalSold');
    const [sortOrder, setSortOrder] = useState('desc');
    const [dateRange, setDateRange] = useState('all');

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.3 }
        }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05
            }
        })
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/api/product/list`);
            if (response.data.success) {
                const processedProducts = response.data.products.map(product => {
                    // Get date ranges
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - 7);
                    
                    const monthStart = new Date(today);
                    monthStart.setDate(1);

                    const sales = product.salesData?.sales || [];
                    
                    // Calculate metrics for each period
                    const calculateMetricsForPeriod = (startDate, endDate) => {
                        return sales.filter(sale => {
                            const saleDate = new Date(sale.date);
                            saleDate.setHours(0, 0, 0, 0); // Normalize time
                            startDate.setHours(0, 0, 0, 0); // Normalize time
                            return saleDate >= startDate && saleDate <= now;
                        }).reduce((acc, sale) => ({
                            totalSold: acc.totalSold + sale.quantity,
                            revenue: acc.revenue + (sale.price * sale.quantity)
                        }), { totalSold: 0, revenue: 0 });
                    };

                    // Calculate metrics for specific periods
                    const todayMetrics = calculateMetricsForPeriod(today, now);
                    const weekMetrics = calculateMetricsForPeriod(weekStart, now);
                    const monthMetrics = calculateMetricsForPeriod(monthStart, now);

                    return {
                        ...product,
                        salesData: {
                            ...product.salesData,
                            today: todayMetrics,
                            week: weekMetrics,
                            month: monthMetrics,
                            totalSold: product.salesData?.totalSold || 0,
                            revenue: product.salesData?.revenue || 0,
                            lastUpdated: product.salesData?.lastUpdated
                        }
                    };
                });
                setProducts(processedProducts);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Set up periodic refresh
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [token]);

    // Add sorting function with date filtering
    const getSortedData = () => {
        return products
            .map(product => {
                // Get the correct sales data based on the date range
                const metrics = dateRange === 'all' ? product.salesData : product.salesData[dateRange];
                
                // Make sure to return the product with the proper metrics
                return {
                    ...product,
                    metrics
                };
            })
            .sort((a, b) => {
                const modifier = sortOrder === 'asc' ? 1 : -1;
    
                if (sortBy === 'totalSold') {
                    return (a.metrics.totalSold - b.metrics.totalSold) * modifier;
                } else if (sortBy === 'revenue') {
                    return (a.metrics.revenue - b.metrics.revenue) * modifier;
                }
                return 0;
            });
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto p-6 space-y-8"
        >
            {/* Header Section */}
            <motion.div 
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md p-6"
            >
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <motion.h2 
                        className="text-2xl font-bold flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                    >
                        <HiChartBar className="text-blue-500" />
                        Sales Analytics
                    </motion.h2>
                    
                    <div className="flex flex-wrap gap-4">
                        <motion.select 
                            whileHover={{ scale: 1.02 }}
                            className="px-4 py-2 border rounded-lg shadow-sm bg-white hover:border-blue-500 transition-colors"
                            onChange={(e) => setDateRange(e.target.value)}
                            value={dateRange}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </motion.select>

                        <motion.select 
                            whileHover={{ scale: 1.02 }}
                            className="px-4 py-2 border rounded-lg shadow-sm bg-white hover:border-blue-500 transition-colors"
                            onChange={(e) => setSortBy(e.target.value)}
                            value={sortBy}
                        >
                            <option value="totalSold">Sort by Sales</option>
                            <option value="revenue">Sort by Revenue</option>
                        </motion.select>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            {sortOrder === 'asc' ? <HiSortAscending /> : <HiSortDescending />}
                            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Table Section */}
            <motion.div 
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Rank', 'Product', 'Total Sold', 'Revenue', 'Last Sale'].map((header) => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {getSortedData().map((product, index) => (
                                <motion.tr 
                                    key={product._id}
                                    custom={index}
                                    variants={tableRowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{ backgroundColor: '#f8fafc' }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">#{index + 1}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden">
                                                <motion.img 
                                                    src={product.image[0]} 
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <motion.div 
                                            className="text-sm text-gray-900"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {dateRange === 'all' 
                                                ? product.salesData.totalSold 
                                                : product.salesData[dateRange].totalSold} units
                                        </motion.div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <motion.div 
                                            className="text-sm text-gray-900"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {currency}
                                            {dateRange === 'all' 
                                                ? product.salesData.revenue 
                                                : product.salesData[dateRange].revenue}
                                        </motion.div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(product.salesData.lastUpdated).toLocaleDateString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InventoryAnalytics;