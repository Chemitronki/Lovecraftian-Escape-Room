<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Log all exceptions with context
            if (app()->environment('production')) {
                \Log::error($e->getMessage(), [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Return JSON responses for API requests
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Handle API exceptions with structured JSON responses.
     */
    protected function handleApiException($request, Throwable $e): JsonResponse
    {
        $status = 500;
        $message = 'Error interno del servidor';
        $errors = null;

        // Validation errors
        if ($e instanceof ValidationException) {
            $status = 422;
            $message = 'Error de validación';
            $errors = $e->errors();
        }
        // Authentication errors
        elseif ($e instanceof AuthenticationException) {
            $status = 401;
            $message = 'No autenticado';
        }
        // Not found errors
        elseif ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            $status = 404;
            $message = 'Recurso no encontrado';
        }
        // HTTP exceptions
        elseif ($e instanceof HttpException) {
            $status = $e->getStatusCode();
            $message = $e->getMessage() ?: 'Error en la solicitud';
        }
        // Generic exceptions
        else {
            $message = app()->environment('production') 
                ? 'Error interno del servidor' 
                : $e->getMessage();
        }

        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        // Include trace in development
        if (app()->environment('local', 'development') && !($e instanceof ValidationException)) {
            $response['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
            ];
        }

        return response()->json($response, $status);
    }
}
