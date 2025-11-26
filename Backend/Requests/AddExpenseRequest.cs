using System.ComponentModel.DataAnnotations;

namespace Backend.Requests
{
    public class AddExpenseRequest
    {
        [Required(ErrorMessage = "Title is required.")]
        [MinLength(2, ErrorMessage = "Title must be at least 2 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Amount is required.")]
        [Range(1, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Category is required.")]
        public string Category { get; set; } = string.Empty;

        // UserId will come from authentication token later (not sent by client)
    }
}
