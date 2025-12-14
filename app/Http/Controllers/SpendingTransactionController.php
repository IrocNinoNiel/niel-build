<?php

namespace App\Http\Controllers;

use App\Http\Resources\SpendingTransactionResource;
use App\Models\SpendingTransaction;
use Illuminate\Http\Request;

class SpendingTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = SpendingTransaction::with('category');

        if ($request->has('start_date')) {
            $query->where('transaction_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('transaction_date', '<=', $request->end_date);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();
        return SpendingTransactionResource::collection($transactions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:spending_categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $transaction = SpendingTransaction::create($validated);
        $transaction->load('category');
        return new SpendingTransactionResource($transaction);
    }

    public function show(SpendingTransaction $transaction)
    {
        $transaction->load('category');
        return new SpendingTransactionResource($transaction);
    }

    public function update(Request $request, SpendingTransaction $transaction)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:spending_categories,id',
            'type' => 'sometimes|required|in:income,expense',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'description' => 'nullable|string',
            'transaction_date' => 'sometimes|required|date',
        ]);

        $transaction->update($validated);
        $transaction->load('category');
        return new SpendingTransactionResource($transaction);
    }

    public function destroy(SpendingTransaction $transaction)
    {
        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted successfully']);
    }
}
