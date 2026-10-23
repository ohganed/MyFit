/**
 * Hand-aligned prototype hit regions for front-surface-atlas-v1.png (1024×1536).
 * Coordinates describe the illustration, NOT validated anatomical boundaries.
 * Keep image and coordinate system versioned together. IDs are catalog IDs.
 * One left-side path is mirrored about x=512 to select the bilateral muscle.
 */
export const frontSurfaceAtlasRegions = [
  { id: 'pectoralis-major', path: 'M410 261 Q447 253 486 264 Q501 274 501 314 L499 354 Q492 382 465 390 Q428 399 399 379 Q378 358 360 337 Q382 293 410 261 Z' },
  { id: 'brachioradialis', path: 'M291 475 C272 490 258 517 251 553 L235 621 L244 634 Q265 595 279 557 Q293 519 295 490 Z' },
  { id: 'flexor-carpi-radialis', path: 'M311 521 Q322 529 319 550 Q309 579 286 610 L255 660 L248 657 L274 602 Q293 554 311 521 Z' },
  { id: 'anterior-deltoid', path: 'M398 247 C367 244 335 266 322 298 C308 323 308 347 316 364 C337 339 367 301 402 261 Z' },
  { id: 'biceps-brachii', path: 'M348 346 C329 359 312 396 307 439 C305 463 307 480 317 489 C333 480 349 452 358 423 C367 393 368 363 358 344 Z' },
  { id: 'serratus-anterior', path: 'M375 371 Q389 383 401 390 L412 412 L399 409 L412 431 L402 430 L413 450 L401 449 L402 465 Q386 449 382 430 Q372 402 375 371 Z' },
  { id: 'external-oblique', path: 'M406 418 Q429 429 442 453 L446 556 L453 613 L447 633 Q413 606 396 580 Q389 564 397 528 Q401 477 395 453 Z' },
  { id: 'rectus-abdominis', path: 'M477 391 Q495 384 503 390 L505 560 L505 671 Q482 665 473 641 L453 580 L453 454 L446 405 Z' },
  { id: 'rectus-femoris', path: 'M394 625 C405 643 418 688 428 737 C440 791 438 838 421 886 L402 930 Q380 888 377 845 C374 787 378 711 387 663 Z' },
  { id: 'vastus-lateralis', path: 'M378 674 C361 702 352 749 354 805 C352 854 361 898 380 930 L394 940 Q380 902 372 865 C364 814 370 755 378 709 Z' },
  { id: 'vastus-medialis', path: 'M456 804 C444 829 434 861 433 895 Q428 919 439 945 Q450 961 463 955 C477 935 481 910 474 881 Z' },
  { id: 'tibialis-anterior', path: 'M389 1025 C376 1052 370 1090 374 1138 L405 1298 L421 1300 C413 1246 404 1176 403 1123 Q403 1057 389 1025 Z' },
] as const
