import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createTransaction } from '@/services/transaction.service.js';
import pool from '@/config/database.js';

// Mock the entire pool module
jest.mock('@/config/database.js');
jest.mock('@/services/pix.service.js');
jest.mock('@/services/account.service.js');

const mockedPool = pool as jest.Mocked<typeof pool>;

describe('Transaction Service', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    // Since pool is a default export, we mock its `connect` property
    mockedPool.connect = jest.fn().mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a credit transaction and update balance correctly', async () => {
      // Arrange
      const initialBalance = 1000;
      const amount = 200;
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ balance: initialBalance }] }) // Get balance
        .mockResolvedValueOnce({}) // Update balance
        .mockResolvedValueOnce({ rows: [{ id: 'new-tx-id' }] }); // Insert transaction

      // Act
      await createTransaction({
        accountId: 'acc-1',
        userId: 'user-1',
        type: 'credit',
        amount,
        description: 'Deposit',
      });

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT balance FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
        ['acc-1', 'user-1']
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE accounts SET balance = $1 WHERE id = $2',
        [initialBalance + amount, 'acc-1']
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
        ['acc-1', 'credit', amount, 'Deposit']
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw an error for insufficient funds on debit', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ balance: 100 }] }); // Get balance

      // Act & Assert
      await expect(createTransaction({
          accountId: 'acc-1',
          userId: 'user-1',
          type: 'debit',
          amount: 200,
          description: 'Withdrawal',
      })).rejects.toThrow('Insufficient funds.');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
