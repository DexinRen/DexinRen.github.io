---
title: "Conditional Probability, Bayes' Rule and Total Probability"
area: "Probability & Statistics"
areaSlug: "probability"
tags: ["probability","statistics"]
order: 2
sources: ["Wiki/Statistics Wiki/Probability/Conditional Probability.md"]
credits: []
---

## Definition 
#### Conditional Probability (Event)
Given the probability of <span class="wl-missing" title="Not published yet">event B</span> as $\mathbb{P}(B)>0$,then the conditional probability of event A given B was already happened is:

$$
\mathbb{P}(A\mid B)=\frac{\mathbb{P}(A\cap B)}{\mathbb{P}(B)}
$$

Other Form:

$$
\left.
\begin{array}{lll} 
\mathbb{P}(A\cap B)&=\mathbb{P}(B)\cdot \mathbb{P}(A|B)\\
&=\mathbb{P}(A)\cdot \mathbb{P}(B|A)&=\mathbb{P}(A,B)\\
\end{array}
\right.
$$

We sometimes use comma to represent intersection $\cap$ sign, so

$$
\mathbb{P}(A\cap B) =\mathbb{P}(A\land B)=\mathbb{P}(A,B)
$$

#### Conditional Probability (r.v.s)
<span class="wl-missing" title="Not published yet">Random variables</span> $X$ and $Y$ are conditionally independent given an r.v. $Z$ if for all $x, y \in \mathbb{R}$ and all $z$ in the support of $Z$

$$
\mathbb{P}[ X \leq x, Y \leq  y|Z = z ] = \mathbb{P}[ X \leq  x|Z = z ]\cdot \mathbb{P}[ Y \leq  y|Z = z ]
$$

For **discrete r.v.s**, an equivalent definition is to require 

$$
\mathbb{P}[ X = x, Y = y|Z = z ] = \mathbb{P}[ X = x|Z = z ]\cdot \mathbb{P}[ Y = y|Z = z ]
$$

#### Odds
the odds of event $A$ are:

$$
\text{odds}(A)=\frac{\mathbb{P}[  A]}{\mathbb{P}[ A^{c} ]}
$$

And we can revert this and get:

$$
\mathbb{P}[ A ]=\frac{\text{odds}(A)}{1+\text{odds}(A)}
$$

#### Prior Probability
The probability distribution before some evidence take into account, in previous definition, $\mathbb{P}(A), \mathbb{P}(B)$ are prior probabilities
#### Posterior Probability
The probability distribution after taking evidences into account, for example, $\mathbb{P}(A|B)$ is a posterior probability of A after taking the appearance of event $B$ into account

#### Independence
Even $A,B$ are conditionally independent given event $E$ if $$\mathbb{P}(A\cap B| E)=\mathbb{P}(A|E)\cdot \mathbb{P}(B|E)$$If $E$ is the initial sample space $S$, we can ignore the condition notation and call $A,B$ independent

If $\mathbb{P}(A|E),\mathbb{P}(B|E)>0$, then this is equivalent to:

$$
\left.
\begin{array}{lll} 
\mathbb{P}(A|B,E)=\mathbb{P}(A|E)\\
\mathbb{P}(B|A,E)=\mathbb{P}(B|E) 
\end{array}
\right.
$$

**Properties**:
- **symmetric**: if $A$ is independent of $B$ given $E$, then $B$ is independent of $A$ given $E$ 
- **Complement independence**: if event $A,B$ are independent given $E$, then $A^{c}, B^{c}$ are also independent under $E$
- **Multiple Events**: Suppose we have a set of conditionally independent events $(A_{i})$ given $E$, and $K$ is **ANY** arbitrary non-empty subset of $(A_{i})$, then:$$\mathbb{P}[\bigcap\limits_{A_{k}\in K} (A_{k}|E) \ ]=\prod_{A_{k}\in K} \mathbb{P}(A_{k}|E)$$

==My interpretation==: Without loss of generality, we set $E=S$, there is a subset $B'=B\cap A$ , and the ratio $\frac{|B'|}{|A|}=\frac{|B|}{|S|}$. In this case, switch the sample space from $S$ to $A$ does not change the probability of event $B$. (Notice $B$ could be empty sample set, and this reasoning still hold)

For example, event $A$ can be "draw a Queen from a standard deck ", and $B$ could be "draw a Heart from a standard deck". Then no matter which event occurred, the total amount of samples in other event and new sample space get scaled by same coefficient, so their probability stays the same.

Notice that independence is limited to given sample space. The change of sample space (or condition) may unevenly change the sample distribution of one event and breaks its independence relationship with others.

## Theories
#### Bayes' Rule

$$
\mathbb{P}(A|B)=\frac{\mathbb{P}(B|A)\mathbb{P}(A)}{\mathbb{P}(B)}
$$

==My Explanation to Bayes' rule==:
Given sample space $S$, we set event $A, B\subseteq S$, then we have:
$\mathbb{P}(A)=\frac{|A|}{|S|},\ \mathbb{P}(B)=\frac{|B|}{|S|},\mathbb{P}(B\cap A)=\frac{|B\cap A|}{|S|}$, thus we have:

$$
\mathbb{P}(A | B)=\frac{\mathbb{P}(A\cap B)}{\mathbb{P}(B)}=\frac{|A\cap B|/|S|}{|B|/|S|}=\frac{|A\cap B|}{|B|}
$$

Then we can interpret Bayes rule as:

$$
P(B|A) = \frac{\mathbb{P}(A|B)\mathbb{P}(B)}{\mathbb{P}(A)}=\frac{(|A\cap B|/|B|)(|B|/|S|)}{|A|/|S|}=\frac{|A\cap B|}{|A|}
$$

#### Bayes' Rule with Extra Conditioning
Given $\mathbb{P}(A,E)>0, \mathbb{P}(B,E)>0$, we have:

$$
\mathbb{P}(A|B,E)=\frac{\mathbb{P}(B|A,E)\cdot \mathbb{P}(A|E)}{\mathbb{P}(B|E)}
$$

#### Bayes' Rule in Odds Form
For any event $A,B$ with positive probabilities, the odds of $A$ given $B$ are:

$$
\frac{\mathbb{P}[ A|B ]}{\mathbb{P}[ A^{c}|B ]}= \frac{\mathbb{P}[ B|A]}{\mathbb{P}[ B|A^{c} ]}\cdot \frac{\mathbb{P}[ A ]}{\mathbb{P}[ A^{c} ]}
$$

#### Law of Total Probability  (LOTP)
Let $(A_{k})_{n}$ as a sequence of disjoint partitions of the sample space $S$, with $\mathbb{P}(A_{k})>0, \forall A_{k}\in (A_{k})_{n}$. Then:

$$
\left.
\begin{array}{lll} 
\mathbb{P}(B)&=\sum_{i}\mathbb{P}(B\cap A_{i})\\ &=\sum\limits^{n}_{i=1}\mathbb{P}(B|A_{i})\cdot\mathbb{P}(A_{i})\\
\end{array}
\right.
$$

![](</notes-media/conditional_probability_lotp.png>)
#### LOTP with Extra Conditioning

$$
\mathbb{P}(B|E)= \sum\limits^{n}_{i=1}\mathbb{P}(B|A_{i},E)\cdot \mathbb{P}(A_{i}|E) 
$$

## Examples

#### LOTP
##### Example 2.3.7
**Question**: You have one fair coin, and one biased coin which lands Heads with probability $\frac{3}{4}$. You pick one of the coins at random and flip it three times. It lands Heads all three times. Given this information, what is the probability that the coin you picked is the fair one?

**Solution**: 
We set "lands Heads all three times" as event $A$, and the "coin used was the fair coin" as event $F$, getting Head as event $H$. 

Then we have the following prior prob. :

$$
\mathbb{P}(F)=\frac{1}{2},\ \mathbb{P}(H|F)= \frac{1}{2},\ \mathbb{P}(H|F^{c})=\frac{3}{4}
$$

We need to know the prob. of $F$ given $A$ so:

$$
\left.
\begin{array}{lll} 
\mathbb{P}(F|A) &= \frac{\mathbb{P}(A|F)\cdot \mathbb{P}(F)}{\mathbb{P}(A)}=\frac{\mathbb{P}^3(H|F)\cdot \mathbb{P}(F)}{\mathbb{P}(A)}
\end{array}
\right.
$$

In this question, event A can occurs while tossing fair coin ($F$) or the biased coin. Thus by LOTP, we have:

$$
\left.
\begin{array}{lll} 

\mathbb{P}(A)&= \mathbb{P}(A\cap F)+\mathbb{P}(A\cap F^c)\\
&=\mathbb{P}(A|F)\cdot\mathbb{P}(F)+\mathbb{P}(A| F^c)\cdot\mathbb{P}(F^{c})
\end{array}
\right.
$$

Thus we have:

$$
\left.
\begin{array}{lll} 
\mathbb{P}(F|A) &= \frac{\mathbb{P}(A|F)\cdot \mathbb{P}(F)}{\mathbb{P}(A)} \\
&=\frac{\mathbb{P}^3(H|F)\cdot \mathbb{P}(F)}{\mathbb{P}(A|F)\cdot\mathbb{P}(F)+\mathbb{P}(A| F^c)\cdot\mathbb{P}(F^{c})}\\
&=\frac{\mathbb{P}^3(H|F)\cdot \mathbb{P}(F)}{\mathbb{P}^{3}(H|F)\cdot\mathbb{P}(F)+\mathbb{P}^{3}(H| F^c)\cdot\mathbb{P}(F^{c})}\\
&=\frac{(0.5)^{3}\cdot(0.5)}{(0.5)^{3}\cdot (0.5)+(0.75)^{3}\cdot (0.5)}\approx 0.23
\end{array}
\right.
$$

##### Example 2.3.9 
**Question**: A patient named Fred is tested for a disease called conditionitis, a medical condition that afflicts $1$% of the population. The test result is positive, i.e., the test claims that Fred has the disease. Let $D$ be the event that Fred has the disease and $T$ be the event that he tests positive. Suppose that the test is “$95$% accurate”; there are different measures of the accuracy of a test, but in this problem it is assumed to mean that $\mathbb{P}(T|D)=0.95$ and $\mathbb{P}(T^{c} |D^{c} )=0.95$. The quantity $\mathbb{P}(T|D)$ is known as the sensitivity or true positive rate of the test, and $\mathbb{P}(T^{c} |D^{c} )$ is known as the specificity or true negative rate. Find the conditional probability that Fred has conditionitis, given the evidence provided by the test result.

**Solution**: in the question we have the following prior prob. :

$$
\left.
\begin{array}{lll} 
\mathbb{P}(D)=0.01,\ \mathbb{P}(T|D)=0.95,\ \mathbb{P}(T^{c} |D^{c})=0.95\\
\end{array}
\right.
$$

We need to find $\mathbb{P}(D|T)$:

$$
\mathbb{P}(D|T) = \frac{\mathbb{P}(T|D)\cdot \mathbb{P}(D)}{\mathbb{P}(T)}
$$

By LOTP, we have:

$$
\left.
\begin{array}{lll} 
\mathbb{P}(T) &= \mathbb{P}(T\cap D) + \mathbb{P}(T\cap D^{c})\\
&=\mathbb{P}(T| D)\cdot\mathbb{P}(D) + \mathbb{P}(T| D^{c})\cdot\mathbb{P}(D^{c})\\
&=\mathbb{P}(T| D)\cdot\mathbb{P}(D) + [1-\mathbb{P}(T^{c}| D^{c})]\cdot[1-\mathbb{P}(D)]\\
&=(0.95)(0.01)+(0.05)(0.99)\\
&=0.059
\end{array}
\right.
$$

Thus:

$$
\left.
\begin{array}{lll} 
\mathbb{P}(D|T) &= \frac{\mathbb{P}(T|D)\cdot \mathbb{P}(D)}{\mathbb{P}(T)}\\ 
&=\frac{(0.95)(0.01)}{0.059}\\
&\approx0.16
\end{array}
\right.
$$

##### Example 2.6.1 
**Question**: Fred, who tested positive for conditionitis in Example 2.3.9, decides to get tested a second time. The new test is independent of the original test (given his disease status) and has the same sensitivity and specificity. Unfortunately for Fred, he tests positive a second time. Find the probability that Fred has the disease, given the evidence, in two ways: in one step, conditioning on both test results simultaneously, and in two steps, first updating the probabilities based on the first test result, and then updating again based on the second test result.

**Solution**: 
Based on example 2.3.9, we have:

$$
\left.
\begin{array}{lll} 
\mathbb{P}(D)=0.01,\ \mathbb{P}(T|D)=0.95,\ \mathbb{P}(T^{c} |D^{c})=0.95\\
\mathbb{P}[ D | T_{1} ]= \frac{\mathbb{P}(T_{1}|D)\cdot \mathbb{P}(D)}{\mathbb{P}(T_{1})}\\
\mathbb{P}[ D | T_{2} ]= \frac{\mathbb{P}(T_{2}|D)\cdot \mathbb{P}(D)}{\mathbb{P}(T_{2})}\\
\end{array}
\right.
$$

We need to get $\mathbb{P}[ D  | T_{1},T_{2} ]=\frac{\mathbb{P}[ T_{1},T_{2}|D ]\cdot \mathbb{P}[ D ]}{\mathbb{P}[ T_{1},T_{2} ]}$

$$
\left.
\begin{array}{lll} 
\mathbb{P}[ T_{1},T_{2} |D]=\mathbb{P}[ T_{1}|D]\cdot \mathbb{P}[ T_{2}|D ]=0.95^2\\
\mathbb{P}[ T_{1},T_{2} |D^{c}]=[1-\mathbb{P}[ T_{1}^{c}|D^{c}]]\cdot [1-\mathbb{P}[ T_{2}^{c}|D^{c} ]]=0.05^2\\
\end{array}
\right.
$$

$$
\left.
\begin{array}{lll} 
\mathbb{P}[ T_{1},T_{2} ]&=\mathbb{P}[ T_{1},T_{2}|D ]\cdot \mathbb{P}[ D ]+\mathbb{P}[ T_{1},T_{2}|D^{c} ]\cdot \mathbb{P}[ D^{c} ]\\ 
&=(0.95^2)0.01+(0.05^2)0.99
\end{array}
\right.
$$

$$
\mathbb{P}[  D|T_{1},T_{2}]=\frac{(0.95^{2})0.01}{(0.95^{2})0.01+(0.05^{2})0.99}\approx0.7848
$$
