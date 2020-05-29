from scipy.stats import beta, binom, expon, foldnorm, gamma, nbinom, norm, poisson, truncnorm
from numpy import linspace, arange, around, nan_to_num
from math import floor, log
from itertools import accumulate

N_TICKS = 201

def calcBeta(mean, sd, plotThis, x=None):
    a = -mean * (mean**2 - mean + sd**2) / sd**2
    b = (mean - 1) * (mean**2 - mean + sd**2) / sd**2
    d = beta(a=a, b=b)
    if x is None:
        x = linspace(0, 1, num=201, endpoint=True)
    return x, yContinuous(d, x, plotThis)

def calcBinomial(mean, sd, plotThis, x=None):
    n = mean ** 2 / (mean - sd ** 2)
    p = 1 - (sd ** 2 / mean)
    d = binom(n=n, p=p)
    if x is None:
        x = xDiscreteZero(d)
    return x, yDiscrete(d, x, plotThis)

def calcExponential(mean, sd, plotThis, x=None):
    scale = mean
    d = expon(scale=scale)
    if x is None:
        x = xContinuousZero(d)
    return x, yContinuous(d, x, plotThis)

def calcFoldedNormal(mean, sd, plotThis, x=None):
    scale = sd
    c = abs(mean) / sd
    d = foldnorm(scale=scale, c=c)
    if x is None:
        x = xContinuousZero(d)
    return x, yContinuous(d, x, plotThis)

def calcGamma(mean, sd, plotThis, x=None):
    a = mean ** 2 / sd ** 2
    scale = sd ** 2 / mean
    d = gamma(a=a, scale=scale)
    if x is None:
        x = xContinuousZero(d)
    return x, yContinuous(d, x, plotThis)

def calcNegativeBinomial(mean, sd, plotThis, x=None):
    n = mean ** 2 / (sd ** 2 - mean)
    p = mean / sd ** 2
    d = nbinom(n=n, p=p)
    if x is None:
        x = xDiscreteZero(d)
    return x, yDiscrete(d, x, plotThis)

def calcNormal(mean, sd, plotThis, x=None):
    loc = mean
    scale = sd
    d = norm(loc=loc, scale=scale)
    if x is None:
        x = around(linspace(mean - 4 * sd, mean + 4 * sd, N_TICKS), 6)
    return x, yContinuous(d, x, plotThis)

def calcPoisson(mean, sd, plotThis, x=None):
    mu = mean
    d = poisson(mu=mu)
    maxx = d.ppf(0.999) + 1
    if x is None:
        x = xDiscreteZero(d)
    return x, yDiscrete(d, x, plotThis)

def calcTruncatedNormal(mean, sd, plotThis, x=None):
    loc = mean
    scale = sd
    a = (0 - mean) / sd
    b = (99999 - mean) / sd
    d = truncnorm(loc=loc, scale=scale, a=a, b=b)
    if x is None:
        x = xContinuousZero(d)
    return x, yContinuous(d, x, plotThis)

def xContinuousZero(d):
    maxx = d.ppf(0.999)
    step = around(maxx, -around(floor(log(maxx, 10)))) / (N_TICKS - 1)
    x = around(arange(0, maxx + step, step), 6)
    return x

def xDiscreteZero(d):
    maxx = d.ppf(0.999) + 1
    x = arange(0, maxx, 1)
    return x

def yContinuous(d, x, plotThis):
    if plotThis == 'fx':
        return nan_to_num(d.pdf(x), posinf=9999)
    else:
        return d.cdf(x)

def yDiscrete(d, x, plotThis):
    if plotThis == 'fx':
        return d.pmf(x)
    else:
        return d.cdf(x)


distmap = {'beta': [calcBeta, 'cont'],
            'binomial': [calcBinomial, 'disc'],
            'exponential': [calcExponential, 'cont'],
            'folded normal': [calcFoldedNormal, 'cont'],
            'gamma': [calcGamma, 'cont'],
            'negative binomial': [calcNegativeBinomial, 'disc'],
            'normal': [calcNormal, 'cont'], 
            'poisson': [calcPoisson, 'disc'],
            'truncated normal': [calcTruncatedNormal, 'cont']}

def oneDistribution(dist, mean, sd, plotThis):
    x, y1 = distmap[dist][0](mean, sd, plotThis)
    type1 = distmap[dist][1]
    return x, around(y1, 6), type1

def twoDistributions(dist1, mean1, sd1, dist2, mean2, sd2, plotThis):
    x1, _ = distmap[dist1][0](mean1, sd1, plotThis)
    x2, _ = distmap[dist2][0](mean2, sd2, plotThis)
    
    minx = min(x1[0], x2[0])
    maxx = max(x1[-1], x2[-1])

    if (distmap[dist1][1] == 'disc' and distmap[dist2][1] == 'disc'):
        x = arange(minx, maxx + 1, 1)
    elif (distmap[dist1][1] == 'cont' and distmap[dist2][1] == 'cont'):
        step = around(maxx - minx, -around(floor(log(maxx - minx, 10)))) / (N_TICKS - 1)
        x = around(arange(minx, maxx + step, step), 6)
    else:  # mixed types
        if maxx < 50:
            step = around(maxx - minx, -around(floor(log(maxx - minx, 10)))) / (N_TICKS - 1)
        elif maxx < 75:
            step = 0.25
        elif maxx < 100:
            step = 0.5
        else:
            step = 1
        x = around(arange(minx, maxx + step, step), 6)
    
    _, y1 = distmap[dist1][0](mean1, sd1, plotThis, x)
    _, y2 = distmap[dist2][0](mean2, sd2, plotThis, x)

    type1 = distmap[dist1][1]
    type2 = distmap[dist2][1]

    return x, around(y1, 6), around(y2, 6), type1, type2
