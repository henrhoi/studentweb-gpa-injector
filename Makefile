iconsrc := icons/logo.png
icondir := icons
iconsizes := {16,32,48,128}
iconfiles := $(shell echo $(icondir)/icon-$(iconsizes).png)

$(icondir)/icon-%.png:
	@mkdir -p $(@D)
	convert $(iconsrc) -resize $* $@

icons: $(iconfiles)

.PHONY: icons
