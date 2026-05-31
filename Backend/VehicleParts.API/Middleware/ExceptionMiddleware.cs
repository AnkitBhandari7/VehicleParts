using System.Net;
using System.Text.Json;

namespace VehicleParts.API.Middleware;

// this middleware catches any crash that happens anywhere in the app
// instead of showing a ugly error page, it returns a clean JSON message
public class ExceptionMiddleware
{
    private readonly RequestDelegate                 _next;
    private readonly ILogger<ExceptionMiddleware>    _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next   = next;
        _logger = logger;
    }

    // every request passes through here - if something crashes we catch it
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            // log the full error details on the server side
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);

            // send a clean error response to the frontend
            await HandleExceptionAsync(context, ex);
        }
    }

    // build a simple JSON error response
    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            success = false,
            message = "An unexpected error occurred. Please try again later.",
            error   = ex.Message
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        return context.Response.WriteAsync(json);
    }
}
