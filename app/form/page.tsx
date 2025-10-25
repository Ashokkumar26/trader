// ...existing code...
"use client"

import React, { useState } from "react";
import Link from "next/link"; // Add this import at the top

interface Trade {
    investorName: string;
    date: string;
    time: string;
    investment: number;
    side: "Profit" | "Loss";
    profitLoss: number;
    brokerage: number;
    createdAt: string;
    percentage: number;
    category: string;         // added
    subCategory?: string;     // added (optional)
}

export default function Form() {
    const [investorName, setInvestorName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("09:00 AM");
    const [investment, setInvestment] = useState("");
    const [side, setSide] = useState<"Profit" | "Loss">("Profit");
    const [profitLoss, setProfitLoss] = useState("");
    const [brokerage, setBrokerage] = useState("");
    const [submittedTrades, setSubmittedTrades] = useState<Trade[]>([]);
    const [category, setCategory] = useState<string>("All");       // added
    const [subCategory, setSubCategory] = useState<string>("");    // added


        const convert24To12Hour = (time24: string): string => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        if (hour === 0) return `12:${minutes} AM`;
        if (hour < 12) return `${hour}:${minutes} AM`;
        if (hour === 12) return `12:${minutes} PM`;
        return `${hour - 12}:${minutes} PM`;
    };

    const convert12To24Hour = (time12: string): string => {
        const [time, modifier] = time12.split(' ');
        let [hours, minutes] = time.split(':');
        let hour = parseInt(hours, 10);
        
        if (hour === 12) hour = 0;
        if (modifier === 'PM') hour = hour + 12;
        
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    // Update time input handler
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time24 = e.target.value;
        const time12 = convert24To12Hour(time24);
        setTime(time12);
    };

// ...existing code...
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate percentage based on profit/loss
    const investmentNum = Number(investment) || 0;
    const profitLossNum = Number(profitLoss) || 0;
    const brokerageNum = Number(brokerage) || 0;
    
    let percentage = 0;
    if (investmentNum > 0) {
        if (side === "Profit") {
            percentage = ((profitLossNum - brokerageNum) / investmentNum) * 100;
        } else {
            percentage = ((profitLossNum + brokerageNum) / investmentNum) * 100;
        }
    }
    
    // Round to 2 decimal places
    const roundedPercentage = Number(percentage.toFixed(2));

    const trade: Trade = {
        investorName,
        date,
        time,
        investment: investmentNum,
        side,
        profitLoss: profitLossNum,
        brokerage: brokerageNum,
        percentage: roundedPercentage,
        createdAt: new Date().toISOString(),
        category,            // included
        subCategory: subCategory || undefined, // included (optional)
    };

    try {
        const base = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${base}/trade`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trade),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("Failed to save trade:", err);
            return;
        }

        const body = await res.json();
        setSubmittedTrades(prev => [trade, ...prev]);

        // reset form
        setInvestorName("");
        setDate("");
        setTime("09:00");
        setInvestment("");
        setSide("Profit");
        setProfitLoss("");
        setBrokerage("");
        setCategory("All");       // reset
        setSubCategory("");       // reset

        console.log("Trade saved:", body);
    } catch (error) {
        console.error("Error submitting trade:", error);
    }
};

    return (
        <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="flex justify-between items-center">
                    <h5 className="text-xl font-medium text-gray-900 dark:text-white">File your Trade</h5>
                    <Link 
                        href="/" 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                    >
                        Go Home →
                    </Link>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Investor Name</label>
                    <input
                        type="text"
                        name="investorName"
                        id="investorName"
                        value={investorName}
                        onChange={e => setInvestorName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Arjun"
                        required
                    />
                </div>

                                {/* Category dropdown */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        required
                    >
                        <option value="All">All</option>
                        <option value="Price Action">Price Action</option>
                        <option value="Indicator">Indicator</option>
                        <option value="Candlestick">Candlestick</option>
                        <option value="Pattern">Pattern</option>
                    </select>
                </div>

                {/* Sub-category optional */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sub Category (optional)</label>
                    <input
                        type="text"
                        name="subCategory"
                        id="subCategory"
                        value={subCategory}
                        onChange={e => setSubCategory(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="e.g., EMA crossover"
                    />
                </div>

                <div className="relative max-w-sm">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                        </svg>
                    </div>
                    <input
                        id="datepicker-actions"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Select date"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select time:</label>
                       <div className="relative">
                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="time"
                        id="time"
                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={convert12To24Hour(time)}
                        onChange={handleTimeChange}
                        required
                    />
                    <span className="absolute right-10 top-2.5 text-gray-500 dark:text-gray-400">
                        {time.split(' ')[1]} {/* Shows AM/PM */}
                    </span>
                </div>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Investment Amount</label>
                    <input
                        type="number"
                        name="investment"
                        id="investment"
                        value={investment}
                        onChange={e => setInvestment(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="10000"
                        required
                    />
                </div>

    <div className="flex items-center gap-6 mb-4">
                    <label className="flex items-center gap-2">
                        <input
                            id="country-option-1"
                            type="radio"
                            name="group"
                            value="Profit"
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            checked={side === "Profit"}
                            onChange={e => setSide(e.target.value as "Profit" | "Loss")}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Profit</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            id="country-option-2"
                            type="radio"
                            name="group"
                            value="Loss"
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                            checked={side === "Loss"}
                            onChange={e => setSide(e.target.value as "Profit" | "Loss")}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Loss</span>
                    </label>
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Profit/Loss Amount</label>
                    <input
                        type="number"
                        name="profitLoss"
                        id="profitLoss"
                        value={profitLoss}
                        onChange={e => setProfitLoss(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="100"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brokerage Fee</label>
                    <input
                        type="number"
                        name="brokerage"
                        id="brokerage"
                        value={brokerage}
                        onChange={e => setBrokerage(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="5"
                        required
                    />
                </div>

                <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
            </form>
             <Link 
                href="/table" 
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
            >
                Go to Trades →
            </Link>
        </div>
    );
}
// ...existing code...