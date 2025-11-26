using Backend.Models;
using Backend.DTOs;
using Backend.Requests;
using Backend.Config;
using MongoDB.Driver;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
  public class ExpenseService
  {
    private readonly IMongoCollection<Expense> _expenses;

    public ExpenseService(IOptions<MongoDbSettings> options)
    {
      var settings = options.Value;
      var client = new MongoClient(settings.ConnectionString);
      var database = client.GetDatabase(settings.DatabaseName);

      _expenses = database.GetCollection<Expense>("Expenses");
    }

    // ------------------------
    // CREATE EXPENSE
    // ------------------------
    public async Task<ExpenseDto> AddExpenseAsync(string userId, AddExpenseRequest request)
    {
      var expense = new Expense
      {
        UserId = userId,
        Title = request.Title,
        Amount = request.Amount,
        Category = request.Category,
        CreatedAt = DateTime.UtcNow
      };

      await _expenses.InsertOneAsync(expense);

      return ToDto(expense);
    }

    // ------------------------
    // GET ALL EXPENSES FOR USER
    // ------------------------
    public async Task<List<ExpenseDto>> GetUserExpensesAsync(string userId)
    {
      var data = await _expenses.Find(x => x.UserId == userId).ToListAsync();
      return data.Select(ToDto).ToList();
    }

    // ------------------------
    // UPDATE EXPENSE
    // ------------------------
    public async Task<bool> UpdateExpenseAsync(string userId, UpdateExpenseRequest request)
    {
      var filter = Builders<Expense>.Filter.Where(x => x.Id == request.Id && x.UserId == userId);

      var update = Builders<Expense>.Update
          .Set(x => x.Title, request.Title)
          .Set(x => x.Amount, request.Amount)
          .Set(x => x.Category, request.Category);

      var result = await _expenses.UpdateOneAsync(filter, update);

      return result.ModifiedCount > 0;
    }

    // ------------------------
    // DELETE EXPENSE
    // ------------------------
    public async Task<bool> DeleteExpenseAsync(string userId, string expenseId)
    {
      var filter = Builders<Expense>.Filter.Where(x => x.Id == expenseId && x.UserId == userId);

      var result = await _expenses.DeleteOneAsync(filter);

      return result.DeletedCount > 0;
    }

    // ------------------------
    // HELPER: MAP MODEL TO DTO
    // ------------------------
    private ExpenseDto ToDto(Expense exp) => new ExpenseDto
    {
      Id = exp.Id,
      UserId = exp.UserId,
      Title = exp.Title ?? string.Empty,
      Amount = exp.Amount,
      Category = exp.Category ?? string.Empty,
      CreatedAt = exp.CreatedAt
    };
  }
}
