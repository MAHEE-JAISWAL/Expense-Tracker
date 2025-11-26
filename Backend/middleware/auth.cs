using System.Net;
using System.Text.Json;

namespace Backend.Middlewares
{
  public class ErrorHandlingMiddleware
  {
    private readonly RequestDelegate _next;

    public ErrorHandlingMiddleware(RequestDelegate next)
    {
      _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
      try
      {
        await _next(context);
      }
      catch (Exception ex)
      {
        await HandleException(context, ex);
      }
    }

    private Task HandleException(HttpContext context, Exception ex)
    {
      context.Response.ContentType = "application/json";
      context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

      var response = new
      {
        success = false,
        message = ex.Message
      };

      return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
  }
}
