using System.ComponentModel.DataAnnotations;

namespace Backend.Requests
{
  public class UpdateProfileRequest
  {
    [Required] public string? Name { get; set; }
    [Required] [EmailAddress] public string? Email { get; set; }
  }
}