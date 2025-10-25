"use client"

import { useEffect, useState } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Trade {
    investorName: string;
    investment: number;
    profitLoss: number;
    brokerage: number;
    percentage: number;
    date: string;
    time: string;
    category: string;
    subCategory?: string;
    side: "Profit" | "Loss";
}

export default function Table() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || "";
                const response = await fetch(`${base}/trade`);
                if (!response.ok) {
                    throw new Error('Failed to fetch trades');
                }
                const data = await response.json();
                setTrades(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error fetching trades');
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
    }, []);

    if (loading) return <div>Loading trades...</div>;
    if (error) return <div>Error: {error}</div>;
    if(trades.length === 0) return <div>No trades found. Please file your first trade.</div>;

    return (
        <div className="p-4">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    List of Trades
                </h1>
                <Link 
                    href="/form" 
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    File Your Trade
                </Link>
            </div>
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Investor Name</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Invested</th>
                        <th scope="col" className="px-6 py-3">Profit/Loss</th>
                        <th scope="col" className="px-6 py-3">Brokerage</th>
                        <th scope="col" className="px-6 py-3">Percentage</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map((trade, index) => (
                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {trade.investorName}
                            </th>
                            <td className="px-6 py-4">
                                {trade.category}{trade.subCategory ? ` - ${trade.subCategory}` : ''}
                            </td>
                            <td className="px-6 py-4">
                                {trade.investment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </td>
                            <td className="px-6 py-4">
                                {`${trade.side}: ${trade.profitLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                            </td>
                            <td className="px-6 py-4">
                                {trade.brokerage.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </td>
                            <td className="px-6 py-4 flex items-center gap-2">
                                {trade.side === "Profit" ? (
                                    <HandThumbUpIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <HandThumbDownIcon className="h-5 w-5 text-red-500" />
                                )}
                                {`${trade.percentage}%`}
                            </td>
                            <td className="px-6 py-4">
                                {trade.date}
                            </td>
                            <td className="px-6 py-4">
                                {trade.time}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
}