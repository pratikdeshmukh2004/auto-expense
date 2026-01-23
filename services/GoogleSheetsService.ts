import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { StorageKeys } from "../constants/StorageKeys";

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export class GoogleSheetsService {
  /**
   * Create a new spreadsheet with Configuration and Transactions sheets
   */
  static async createAutoExpenseSheet(): Promise<{
    spreadsheetId: string;
    spreadsheetUrl: string;
  } | null> {
    try {
      // Get current user and tokens
      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      // Create new spreadsheet
      const createResponse = await fetch(SHEETS_API_BASE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            title: `Auto Expense ${new Date().getFullYear()}`,
          },
          sheets: [
            {
              properties: {
                title: "Configuration",
                gridProperties: { frozenRowCount: 1 },
              },
            },
            {
              properties: {
                title: "Transactions",
                gridProperties: { frozenRowCount: 1 },
              },
            },
          ],
        }),
      });

      const spreadsheet = await createResponse.json();
      const spreadsheetId = spreadsheet.spreadsheetId;

      // Format the sheets
      await this.formatConfigurationSheet(spreadsheetId, accessToken);
      await this.formatTransactionsSheet(spreadsheetId, accessToken);

      // Initialize with default data
      await this.initializeDefaultData(spreadsheetId, accessToken);

      // Save spreadsheet ID
      await SecureStore.setItemAsync(StorageKeys.GOOGLE_SHEET_ID, spreadsheetId);

      return {
        spreadsheetId,
        spreadsheetUrl: spreadsheet.spreadsheetUrl,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Format Configuration sheet with all app data
   */
  private static async formatConfigurationSheet(
    spreadsheetId: string,
    accessToken: string,
  ) {
    // Add headers using values API
    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!A1:B1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [["Key", "Value"]],
        }),
      },
    );

    // Format headers
    await this.batchUpdate(spreadsheetId, accessToken, [
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.92, green: 0.16, blue: 0.19 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                bold: true,
              },
              horizontalAlignment: "CENTER",
            },
          },
          fields: "userEnteredFormat",
        },
      },
    ]);
  }

  /**
   * Format Transactions sheet with transaction columns
   */
  private static async formatTransactionsSheet(
    spreadsheetId: string,
    accessToken: string,
  ) {
    // Add headers using values API
    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/Transactions!A1:I1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [[
            "Date",
            "Merchant",
            "Amount",
            "Category",
            "Payment Method",
            "Type",
            "Status",
            "Notes",
            "Created At",
          ]],
        }),
      },
    );

    // Format headers
    await this.batchUpdate(spreadsheetId, accessToken, [
      {
        repeatCell: {
          range: {
            sheetId: 1,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.92, green: 0.16, blue: 0.19 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                bold: true,
              },
              horizontalAlignment: "CENTER",
            },
          },
          fields: "userEnteredFormat",
        },
      },
    ]);
  }

  /**
   * Initialize sheets with default data
   */
  private static async initializeDefaultData(
    spreadsheetId: string,
    accessToken: string,
  ) {
    // Get default data from storage
    const categoriesJson = await SecureStore.getItemAsync(
      StorageKeys.CATEGORIES,
    );
    const paymentMethodsJson = await SecureStore.getItemAsync(
      StorageKeys.PAYMENT_METHODS,
    );
    const keywordsJson = await SecureStore.getItemAsync(
      StorageKeys.BANK_KEYWORDS,
    );
    const approvedSendersJson = await SecureStore.getItemAsync(
      StorageKeys.APPROVED_SENDERS,
    );

    const categories = categoriesJson ? JSON.parse(categoriesJson) : [];
    const paymentMethods = paymentMethodsJson
      ? JSON.parse(paymentMethodsJson)
      : [];
    const keywords = keywordsJson ? JSON.parse(keywordsJson) : [];
    const approvedSenders = approvedSendersJson
      ? JSON.parse(approvedSendersJson)
      : [];

    // Categories Table (Columns A-E)
    const categoriesData = [
      ["ID", "Name", "Icon", "Color", "Description"],
      ...categories.map((cat: any) => [
        cat.id,
        cat.name,
        cat.icon,
        cat.color,
        cat.description || "",
      ]),
    ];

    // Payment Methods Table (Columns G-L)
    const paymentMethodsData = [
      ["ID", "Name", "Type", "Icon", "Color", "Last 4"],
      ...paymentMethods.map((pm: any) => [
        pm.id,
        pm.name,
        pm.type,
        pm.icon,
        pm.color,
        pm.last4 || "",
      ]),
    ];

    // Keywords Table (Columns N-P)
    const keywordsData = [
      ["ID", "Keyword", "Category"],
      ...keywords.map((kw: any) => [kw.id, kw.keyword, kw.category]),
    ];

    // Approved Senders Table (Columns R-S)
    const approvedSendersData = [
      ["Sender", "Payment Method"],
      ...approvedSenders.map((sender: any) => [
        sender.sender,
        sender.paymentMethod || "",
      ]),
    ];

    // Update all tables in Configuration sheet
    await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "RAW",
        data: [
          { range: "Configuration!A1", values: categoriesData },
          { range: "Configuration!G1", values: paymentMethodsData },
          { range: "Configuration!N1", values: keywordsData },
          { range: "Configuration!R1", values: approvedSendersData },
        ],
      }),
    });

    // Convert ranges to Google Sheets Tables
    const tableRequests = [
      // Categories table (A1:E20)
      {
        addDataSource: {
          dataSource: {
            spec: {
              parameters: [
                {
                  dataSourceSheetProperties: {
                    sheetId: 0,
                    columns: [
                      { reference: { columnId: "A" } },
                      { reference: { columnId: "B" } },
                      { reference: { columnId: "C" } },
                      { reference: { columnId: "D" } },
                      { reference: { columnId: "E" } },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
      // Payment Methods table (G1:L5)
      {
        addDataSource: {
          dataSource: {
            spec: {
              parameters: [
                {
                  dataSourceSheetProperties: {
                    sheetId: 0,
                    columns: [
                      { reference: { columnId: "G" } },
                      { reference: { columnId: "H" } },
                      { reference: { columnId: "I" } },
                      { reference: { columnId: "J" } },
                      { reference: { columnId: "K" } },
                      { reference: { columnId: "L" } },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
      // Keywords table (N1:P26)
      {
        addDataSource: {
          dataSource: {
            spec: {
              parameters: [
                {
                  dataSourceSheetProperties: {
                    sheetId: 0,
                    columns: [
                      { reference: { columnId: "N" } },
                      { reference: { columnId: "O" } },
                      { reference: { columnId: "P" } },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
      // Approved Senders table (R1:S)
      {
        addDataSource: {
          dataSource: {
            spec: {
              parameters: [
                {
                  dataSourceSheetProperties: {
                    sheetId: 0,
                    columns: [
                      { reference: { columnId: "R" } },
                      { reference: { columnId: "S" } },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    ];

    // Apply table formatting
    try {
      await this.batchUpdate(spreadsheetId, accessToken, tableRequests);
    } catch (error) {
    }
  }

  /**
   * Batch update helper
   */
  private static async batchUpdate(
    spreadsheetId: string,
    accessToken: string,
    requests: any[],
  ) {
    await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    });
  }

  /**
   * Add a transaction to the sheet
   */
  static async addTransaction(transaction: any): Promise<boolean> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return false;

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const row = [
        transaction.date,
        transaction.merchant,
        transaction.amount,
        transaction.category,
        transaction.paymentMethod,
        transaction.type,
        transaction.status,
        transaction.notes || "",
        new Date().toISOString(),
      ];

      await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Transactions!A:I:append?valueInputOption=RAW`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [row],
          }),
        },
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all transactions from the sheet
   */
  static async getTransactions(): Promise<any[]> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return [];

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Transactions!A2:I`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];

      return rows.map((row: any[], index: number) => ({
        id: (index + 1).toString(),
        merchant: row[1] || '',
        amount: row[2] || '',
        category: row[3] || '',
        paymentMethod: row[4] || '',
        date: row[0] || '',
        timestamp: new Date(row[0] || new Date()),
        type: row[5] || 'expense',
        status: row[6] || 'completed',
        notes: row[7] || '',
        rawMessage: '',
        sender: '',
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }

  /**
   * Delete a specific transaction by row number
   */
  static async deleteTransactionRow(rowIndex: number): Promise<boolean> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return false;

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      // Delete the specific row (rowIndex + 1 because sheets are 1-indexed, +1 more for header)
      const response = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 1, // Transactions sheet
                dimension: "ROWS",
                startIndex: rowIndex + 1, // +1 for header row
                endIndex: rowIndex + 2
              }
            }
          }]
        }),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete transaction by ID (finds row and deletes it)
   */
  static async deleteTransactionById(transactionId: string): Promise<boolean> {
    try {
      const transactions = await this.getTransactions();
      const rowIndex = transactions.findIndex(t => t.id === transactionId);
      
      if (rowIndex === -1) {
        return false;
      }

      return await this.deleteTransactionRow(rowIndex);
    } catch (error) {
      return false;
    }
  }
  static async saveTransactions(transactions: any[]): Promise<boolean> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return false;

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const rows = transactions.map(t => [
        t.date, t.merchant, t.amount, t.category, t.paymentMethod,
        t.type, t.status, t.notes || '', t.createdAt || new Date().toISOString()
      ]);

      const response = await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Transactions!A2:I?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rows,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get categories from Configuration sheet
   */
  static async getCategories(): Promise<any[]> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) {
        return [];
      }

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!A2:E`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];

      const categories = rows.map((row: any[]) => ({
        id: row[0] || '',
        name: row[1] || '',
        icon: row[2] || '',
        color: row[3] || '',
        description: row[4] || '',
      }));
      
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  /**
   * Save categories to Configuration sheet
   */
  static async saveCategories(categories: any[]): Promise<boolean> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return false;

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const rows = categories.map(c => [c.id, c.name, c.icon, c.color, c.description || '']);

      await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!A2:E?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rows,
          }),
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get payment methods from Configuration sheet
   */
  static async getPaymentMethods(): Promise<any[]> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) {
        return [];
      }

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!G2:L`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];

      return rows.map((row: any[]) => ({
        id: row[0] || '',
        name: row[1] || '',
        type: row[2] || '',
        icon: row[3] || '',
        color: row[4] || '',
        last4: row[5] || '',
      }));
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return [];
    }
  }

  /**
   * Save payment methods to Configuration sheet
   */
  static async savePaymentMethods(methods: any[]): Promise<boolean> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return false;

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const rows = methods.map(m => [m.id, m.name, m.type, m.icon, m.color, m.last4 || '']);

      await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!G2:L?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rows,
          }),
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get keywords from Configuration sheet
   */
  static async getKeywords(): Promise<any[]> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return [];

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const response = await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!N2:P`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      const rows = data.values || [];

      return rows.map((row: any[]) => ({
        id: row[0] || '',
        keyword: row[1] || '',
        category: row[2] || '',
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Save keywords to Configuration sheet
   */
  static async saveKeywords(keywords: any[]): Promise<boolean> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return false;

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const rows = keywords.map(k => [k.id, k.keyword, k.category]);

      await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!N2:P?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rows,
          }),
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get approved senders from Configuration sheet
   */
  static async getApprovedSenders(): Promise<any[]> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return [];

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const response = await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!R2:S`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      const rows = data.values || [];

      return rows.map((row: any[]) => ({
        sender: row[0] || '',
        paymentMethod: row[1] || '',
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Save approved senders to Configuration sheet
   */
  static async saveApprovedSenders(senders: any[]): Promise<boolean> {
    try {
      const spreadsheetId = await SecureStore.getItemAsync(StorageKeys.GOOGLE_SHEET_ID);
      if (!spreadsheetId) return false;

      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const rows = senders.map(s => [s.sender, s.paymentMethod || '']);

      await fetch(
        `${SHEETS_API_BASE}/${spreadsheetId}/values/Configuration!R2:S?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rows,
          }),
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}
