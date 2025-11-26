using Backend.Requests;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
  [ApiController]
  [Route("api/expenses")]
  public class ExpenseController : ControllerBase
  {
    private readonly ExpenseService _expenseService;

    public ExpenseController(ExpenseService expenseService)
    {
      _expenseService = expenseService;
    }

    // ---------------------------
    // ADD EXPENSE
    // ---------------------------
    [HttpPost("add")]
    [Authorize]
    public async Task<IActionResult> AddExpense([FromBody] AddExpenseRequest request)
    {
      if (!ModelState.IsValid)
        return BadRequest(new { success = false, errors = ModelState });  // <- shows errors

      var userId = HttpContext.Items["UserId"]?.ToString();
      if (userId == null)
        return Unauthorized(new { success = false, message = "Token invalid — userId not found" });

      var result = await _expenseService.AddExpenseAsync(userId, request);
      return Ok(result);
    }

    // ---------------------------
    // GET EXPENSES
    // ---------------------------
    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetExpenses()
    {
      var userId = HttpContext.Items["UserId"]?.ToString();
      if (userId == null) return Unauthorized();

      var data = await _expenseService.GetUserExpensesAsync(userId);
      return Ok(data);
    }

    // ---------------------------
    // UPDATE EXPENSE
    // ---------------------------
    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateExpense([FromBody] UpdateExpenseRequest request)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var userId = HttpContext.Items["UserId"]?.ToString();
      if (userId == null) return Unauthorized();

      var success = await _expenseService.UpdateExpenseAsync(userId, request);

      if (!success) return NotFound("Expense not found.");

      return Ok("Expense updated successfully.");
    }

    // ---------------------------
    // DELETE EXPENSE
    // ---------------------------
    [HttpDelete("delete/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteExpense(string id)
    {
      var userId = HttpContext.Items["UserId"]?.ToString();
      if (userId == null) return Unauthorized();

      var success = await _expenseService.DeleteExpenseAsync(userId, id);

      if (!success) return NotFound("Expense not found.");

      return Ok("Expense deleted.");
    }
  }
}
