# Non-Euclidean Representations in Machine Learning

## Abstract

This paper explores the application of non-Euclidean geometry in representation learning, highlighting how hyperbolic and spherical spaces can better capture hierarchical and directional data structures compared to traditional Euclidean spaces. We demonstrate that many real-world datasets exhibit inherent non-Euclidean properties and benefit from embedding in these alternative geometric spaces.

## 1. Introduction

Machine learning algorithms traditionally operate in Euclidean space, where the distance between points is measured using a straight line. However, many types of data—particularly those with hierarchical structures, network relationships, or directional constraints—do not conform well to Euclidean assumptions. This mismatch can lead to the "curse of dimensionality" and inefficient representations that require unnecessary complexity.

Non-Euclidean geometries, particularly hyperbolic and spherical spaces, offer alternative frameworks that can more naturally represent certain data structures. In this paper, we explore the theoretical foundations and practical applications of these alternative spaces in machine learning.

## 2. Theoretical Background

### 2.1 Hyperbolic Geometry

Hyperbolic spaces are characterized by negative curvature, allowing the space to expand exponentially with distance from any point. This property makes hyperbolic embeddings particularly suited for hierarchical data, as they can represent exponentially branching structures in relatively low dimensions.

The distance function in hyperbolic space (using the Poincaré disk model) is:

$$d(u, v) = \text{acosh}\left(1 + 2\frac{||u-v||^2}{(1-||u||^2)(1-||v||^2)}\right)$$

### 2.2 Spherical Geometry

Spherical spaces have positive curvature and are bounded, making them well-suited for directional or normalized data. The distance between two points on a sphere is measured along the great circle connecting them.

The distance function on a sphere is:

$$d(u, v) = \arccos(\langle u, v \rangle)$$

where $\langle u, v \rangle$ is the dot product of unit vectors $u$ and $v$.

## 3. Applications in Representation Learning

### 3.1 Knowledge Graph Embeddings

Hierarchical knowledge graphs often exhibit tree-like structures that are difficult to embed in Euclidean space without distortion. Our experiments show that hyperbolic embeddings can achieve better link prediction accuracy with significantly fewer dimensions compared to Euclidean embeddings.

### 3.2 Natural Language Processing

Word embeddings in spherical space can better capture semantic similarity, especially for directional relationships. Our results demonstrate improved performance on word analogy and similarity tasks compared to traditional word embedding methods.

### 3.3 Network Analysis

Social and biological networks often exhibit hierarchical community structures with exponential growth patterns. We show that hyperbolic embeddings can preserve these structures more efficiently than Euclidean alternatives.

## 4. Optimization in Non-Euclidean Spaces

Optimization in curved spaces presents unique challenges, as traditional gradient-based methods assume Euclidean geometry. We explore Riemannian optimization techniques including:

- Riemannian gradient descent
- Exponential mapping
- Parallel transport

Our experiments demonstrate that these methods can effectively optimize models in non-Euclidean spaces while respecting the underlying geometric constraints.

## 5. Experimental Results

We evaluate non-Euclidean embeddings across multiple datasets, including:

- WordNet hierarchy (tree-like structure)
- Protein interaction networks (complex biological networks)
- Word embeddings (semantic relationships)

In all cases, the appropriate non-Euclidean geometry outperforms Euclidean embeddings of the same dimension, often by a significant margin.

## 6. Conclusion

Non-Euclidean representations offer powerful alternatives to traditional Euclidean embeddings for many types of structured data. By choosing geometries that better match the intrinsic structure of the data, we can achieve more efficient and accurate representations. Future work will focus on developing more sophisticated optimization techniques and extending these approaches to deep learning architectures.

## References

1. Nickel, M., & Kiela, D. (2017). Poincaré embeddings for learning hierarchical representations. In Advances in Neural Information Processing Systems (pp. 6338-6347).

2. Ganea, O. E., Bécigneul, G., & Hofmann, T. (2018). Hyperbolic neural networks. In Advances in Neural Information Processing Systems (pp. 5345-5355).

3. Wilson, B., & Leimeister, M. (2018). Gradient descent in hyperbolic space. arXiv preprint arXiv:1805.08207.

4. Davidson, T. R., Falorsi, L., De Cao, N., Kipf, T., & Tomczak, J. M. (2018). Hyperspherical variational auto-encoders. In Proceedings of the 34th Conference on Uncertainty in Artificial Intelligence.

5. Bachmann, G., Becigneul, G., & Ganea, O. E. (2020). Constant Curvature Graph Convolutional Networks. In International Conference on Machine Learning (pp. 486-496).
