<?php

namespace Tests\Feature;

use Tests\TestCase;

class RouteTest extends TestCase
{
    /**
     * Test the root landing page route.
     */
    public function test_landing_page_returns_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertViewIs('order_landing');
    }

    /**
     * Test the health check endpoint.
     */
    public function test_health_endpoint_returns_valid_json(): void
    {
        $response = $this->get('/health');

        $response->assertStatus(200);
        $response->assertExactJson([
            'status' => 'ok',
            'service' => 'order-process'
        ]);
    }
}
