from scipy.stats import binom, expon, foldnorm, gamma, nbinom, norm, poisson
from numpy import linspace, arange, round, nan_to_num
from math import floor, log
from itertools import accumulate

N_TICKS = 201


def calcBinomial(mean, sd, plotThis):
    n = mean ** 2 / (mean - sd ** 2)
    p = 1 - (sd ** 2 / mean)
    d = binom(n=n, p=p)

    x = xDiscreteZero(d)

    return x, yDiscrete(d, x, plotThis)

def calcExponential(mean, sd, plotThis):
    scale = mean
    d = expon(scale=scale)
    # mean = 1 / lambda = scale
    
    x = xDiscreteZero(d)
    
    return x, yContinuous(d, x, plotThis)

def calcFoldedNormal(mean, sd, plotThis):
    # implied parameter loc=0; governs where fold happens
    scale = sd
    c = mean / sd
    d = foldnorm(scale=scale, c=c)

    x = xDiscreteZero(d)

    return x, yContinuous(d, x, plotThis)

def calcGamma(mean, sd, plotThis):
    a = mean ** 2 / sd ** 2
    scale = sd ** 2 / mean
    d = gamma(a=a, scale=scale)

    x = xDiscreteZero(d)
    
    return x, yContinuous(d, x, plotThis)

def calcNegativeBinomial(mean, sd, plotThis):
    n = mean ** 2 / (sd ** 2 - mean)
    p = mean / sd ** 2
    d = nbinom(n=n, p=p)

    x = xDiscreteZero(d)
    
    return x, yDiscrete(d, x, plotThis)

def calcNormal(mean, sd, plotThis):
    loc = mean
    scale = sd
    d = norm(loc=loc, scale=scale)

    x = round(linspace(mean - 4 * sd, mean + 4 * sd, N_TICKS), 6)
    
    return x, yContinuous(d, x, plotThis)

def calcPoisson(mean, sd, plotThis):
    mu = mean
    d = poisson(mu=mu)

    maxx = d.ppf(0.999) + 1
    
    x = xDiscreteZero(d)
    
    return x, yDiscrete(d, x, plotThis)

def xContinuousZero(d):
    maxx = d.ppf(0.999)
    step = round(maxx, -round(floor(log(maxx, 10)))) / (N_TICKS - 1)
    x = linspace(0, max(step * N_TICKS, maxx // step * step), num=max(N_TICKS, int(maxx // step)), endpoint=False)
    return x

def xDiscreteZero(d):
    maxx = d.ppf(0.999) + 1
    x = arange(0, maxx, 1)
    return x

def yContinuous(d, x, plotThis):
    if plotThis == 'fx':
        return d.pdf(x)
    else:
        return d.cdf(x)

def yDiscrete(d, x, plotThis):
    if plotThis == 'fx':
        return d.pmf(x)
    else:
        return d.cdf(x)



if __name__ == '__main__':
    mean = 0
    sd = 1
    x, fx, Fx = calcNormal(mean, sd)
    print(x)
    print(fx)
    print(Fx)
