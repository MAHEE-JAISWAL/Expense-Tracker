namespace Backend.DTOs
{
  public class ExpenseDto
  {
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
  }
}
