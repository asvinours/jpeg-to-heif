# JPEG image to HEIF image

### This is just a POC repository

My only goal was to prove that I could create heif images from jpeg files
Few things to know about this repository:
 - the original jpeg images have not been optimized. A jpegoptim Q90 version is also available for most images
 - jpeg images need to have even width and even height (don 't ask me why)
 - to display the images I used the nokia JS implementation

Examples: https://asvinours.github.io/jpeg-to-heif/index.html?file=cat-914110_1920.jpg&q=90&f=webp

Most of the JS and HTML code is coming from https://compare.rokka.io/_compare/
I am not entirely sure if it was okay to copy it but I was unable to find any license terms on their web page.

Instructions to build the heif images have been copied from:
 - http://jpgtoheif.com/
 - https://gpac.wp.imt.fr/2017/06/09/gpac-support-for-heif/

TODO:
 - create heif image collections

If you want to test it by yourself, I have added a Dockerfile to build gpac and all the required tools
```bash
# this will build the gpac docker image
$ docker-compose build
# this will start the nginx web-server
$ docker-compose up
```

To convert images:
```bash
$ for F in *.jpg *.jpeg; \
  do ffmpeg -i ./$F -crf 23 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -preset slower -pix_fmt yuv420p -f hevc $F.hvc && \
     MP4Box -add-image $F.hvc -ab heic -new $F.heic && \
     rm $F.hvc;
  done;
```

### Small benchmark on the ffmpeg preset

```bash
$ cat speed-test.sh
ffmpeg -hide_banner -loglevel panic -i ./$1 -crf 23 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -preset $2 -pix_fmt yuv420p -f hevc $1.hvc && MP4Box -add-image $1.hvc -ab heic -new $1-$2.heif && rm $1.hvc;
echo -n "Size: ";
ls -l $1-$2.heif | awk '{ print $5 }' | awk '{ suffix="KMGT"; for(i=0; $1>1024 && i < length(suffix); i++) $1/=1024; print int($1) substr(suffix, i, 1), $3; }'

$ file kittens-cat-cat-puppy-rush-45170.jpeg
kittens-cat-cat-puppy-rush-45170.jpeg: JPEG image data, JFIF standard 1.01, aspect ratio, density 1x1, segment length 16, Exif Standard: [TIFF image data, little-endian, direntries=3, manufacturer=SONY, model=DSC-H2], baseline, precision 8, 2400x1334, frames 3

$ ls -lh kittens-cat-cat-puppy-rush-45170.jpeg
1.5M Sep 10 21:31 kittens-cat-cat-puppy-rush-45170.jpeg

$ for V in ultrafast superfast veryfast faster fast medium slow slower veryslow; do echo "Speed: $V"; time bash speed-test.sh
 kittens-cat-cat-puppy-rush-45170.jpeg $V  2>&1 | grep -P "real|Size:"; done
Speed: ultrafast
Size: 414K
real    0m0.785s

Speed: superfast
Size: 406K
real    0m1.723s

Speed: veryfast
Size: 299K
real    0m1.821s

Speed: faster
Size: 299K
real    0m1.820s

Speed: fast
Size: 299K
real    0m1.832s

Speed: medium
Size: 298K
real    0m1.905s

Speed: slow
Size: 244K
real    0m3.227s

Speed: slower
Size: 244K
real    0m3.855s

Speed: veryslow
Size: 243K
real    0m3.991s
```

### Another test with 5000+ images
I can't provide you with the test images for this one because I used images from my job and well.. I work in the adult industry and I don't want anyone to get offended by the images

What I can say is that it is a set of 5000+ images of different dimensions and jpeg quality. Original images are not compressed, just exported from the original video in original dimensions and original jpeg quality.

```bash
image-tests/originals$ for F in *.jpg *.jpeg; do ffmpeg -i ./$F -crf 23 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -preset medium -pix_fmt yuv420p -f hevc $F.hvc && MP4Box -add-image $F.hvc -ab heic -new $F.heic && rm $F.hvc; done

image-tests/originals$ find . -type f -regex ".+\.jpe?g$" | wc -l
5297

image-tests/originals$ find . -type f -regex ".+\.jpe?g$" -exec ls -l {} \; | awk '{ s+=$5 } END { print s }' | awk '{ suffix="KMGT"; for(i=0; $1>1024 && i < length(suffix); i++) $1/=1024; print int($1) substr(suffix, i, 1), $3; }'
689M

image-tests/originals$ find . -type f -regex ".+\.heic$" | wc -l
5295

image-tests/originals$ find . -type f -regex ".+\.heic$" -exec ls -l {} \; | awk '{ s+=$5 } END { print s }' | awk '{ suffix="KMGT"; for(i=0; $1>1024 && i < length(suffix); i++) $1/=1024; print int($1) substr(suffix, i, 1), $3; }'
100M

image-tests/originals$ find . -type f -regex ".+\.jpe?g$" -exec file {} \; | awk -F, '{for(i=1;i<=NF;i++){if($i~/x/){print $i}}}' | grep -v density | grep -P "\d{3,}x\d{2,}" | sort | uniq -c | sort -n
     [...]
     83  1440x810
     94  360x240
    131  640x480
    142  720x480
    163  426x240
    278  854x480
    334  320x240
   1070  1920x1080
   1911  1280x720
```
