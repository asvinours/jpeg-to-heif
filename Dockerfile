FROM ubuntu:16.04

ADD ./lib /tmp/gpac

RUN apt-get update && \
  apt-get install -y \
    cmake \
    make \
    g++ \
    unzip \
    ffmpeg \
    scons \
    wget \
    git \
    binutils \
    cpp-5 \
    language-pack-en-base \
    libacl1 \
    libattr1 \
    libc6 \
    libc6-dev \
    libgcc-5-dev \
    libgmp10 \
    libisl15 \
    libjpeg-turbo8-dev \
    libmpc3 \
    libmpfr4 \
    libpcre3 \
    libpng16-dev \
    libreadline6 \
    libselinux1 \
    libsigsegv2 \
    libtinfo5 \
    linux-libc-dev \
    locales \
    python-pkg-resources \
    libonig2 \
    zlib1g \
    zlib1g-dev
  
RUN cd /tmp/gpac && \
  tar -xzvf v0.7.1.tar.gz && \
  unzip gpac_extra_libs.zip && \
  mkdir -p /tmp/gpac/gpac-0.7.1/extra_lib/lib/gcc/ && \
  cd gpac_extra_libs/ && \
  git clone https://github.com/OpenHEVC/openHEVC.git openhevc && \
  chmod +x unzip_all.sh && \
  ./unzip_all.sh && \
  chmod +x build_opensvc_static.sh && \
  chmod +x build_openhevc_static.sh && \
  cd PlatinumSDK && \
  chmod +x BuildAndCopy2Public.sh && \
  ./BuildAndCopy2Public.sh x86-unknown-linux && \
  cp -r Platinum/Build/Targets/x86-unknown-linux/Debug/* /tmp/gpac/gpac-0.7.1/extra_lib/lib/gcc/ && \
  cd /tmp/gpac/gpac_extra_libs && \
  ./build_opensvc_static.sh && \
  cp opensvc/svcsvn/libOpenSVCDec.a /tmp/gpac/gpac-0.7.1/extra_lib/lib/gcc/ && \
  cd /tmp/gpac/gpac_extra_libs && \
  ./build_openhevc_static.sh && \
  cp openhevc/libLibOpenHevcWrapper.a /tmp/gpac/gpac-0.7.1/extra_lib/lib/gcc/ && \
  cd /tmp/gpac/gpac-0.7.1 && \
  chmod +x configure && \
  ./configure && \
  make lib && \
  make apps && \
  make install lib && \
  make install && \
  cp bin/gcc/libgpac.so /usr/lib

