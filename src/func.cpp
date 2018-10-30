#include <emscripten.h>
#include <iostream>
#include <cstdlib>
#include <cmath>

EMSCRIPTEN_KEEPALIVE
double log(double a, double b)
{
    return log(b) / log(a);
}